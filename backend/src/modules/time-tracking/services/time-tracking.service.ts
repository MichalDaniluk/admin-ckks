import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { TimeEntry, TimeEntryStatus } from '../entities/time-entry.entity';
import { CreateTimeEntryDto } from '../dto/create-time-entry.dto';
import { UpdateTimeEntryDto } from '../dto/update-time-entry.dto';
import { QueryTimeEntriesDto } from '../dto/query-time-entries.dto';

@Injectable()
export class TimeTrackingService {
  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
  ) {}

  async create(
    createDto: CreateTimeEntryDto,
    userId: string,
    tenantId: string,
  ): Promise<TimeEntry> {
    const timeEntry = this.timeEntryRepository.create({
      ...createDto,
      userId,
      tenantId,
    });

    // Calculate duration if both start and end times are provided
    if (timeEntry.startTime && timeEntry.endTime) {
      timeEntry.calculateDuration();
    }

    return await this.timeEntryRepository.save(timeEntry);
  }

  async findAll(queryDto: QueryTimeEntriesDto, tenantId: string) {
    const {
      page = 1,
      limit = 10,
      search,
      userId,
      status,
      entryType,
      dateFrom,
      dateTo,
      isBillable,
      sortBy = 'entryDate',
      sortOrder = 'DESC',
    } = queryDto;

    const query = this.timeEntryRepository
      .createQueryBuilder('timeEntry')
      .leftJoinAndSelect('timeEntry.user', 'user')
      .where('timeEntry.tenantId = :tenantId', { tenantId });

    // Filters
    if (search) {
      query.andWhere(
        '(timeEntry.projectName ILIKE :search OR timeEntry.taskDescription ILIKE :search OR timeEntry.notes ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (userId) {
      query.andWhere('timeEntry.userId = :userId', { userId });
    }

    if (status) {
      query.andWhere('timeEntry.status = :status', { status });
    }

    if (entryType) {
      query.andWhere('timeEntry.entryType = :entryType', { entryType });
    }

    if (dateFrom) {
      query.andWhere('timeEntry.entryDate >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      query.andWhere('timeEntry.entryDate <= :dateTo', { dateTo });
    }

    if (isBillable !== undefined) {
      query.andWhere('timeEntry.isBillable = :isBillable', { isBillable });
    }

    // Sorting
    query.orderBy(`timeEntry.${sortBy}`, sortOrder);

    // Pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, tenantId: string): Promise<TimeEntry> {
    const timeEntry = await this.timeEntryRepository.findOne({
      where: { id, tenantId },
      relations: ['user', 'approver'],
    });

    if (!timeEntry) {
      throw new NotFoundException('Time entry not found');
    }

    return timeEntry;
  }

  async update(
    id: string,
    updateDto: UpdateTimeEntryDto,
    tenantId: string,
  ): Promise<TimeEntry> {
    const timeEntry = await this.findOne(id, tenantId);

    // Check if entry can be edited
    if (!timeEntry.canEdit() && timeEntry.status !== TimeEntryStatus.DRAFT) {
      throw new BadRequestException(
        'Cannot edit time entry that is not in draft status',
      );
    }

    Object.assign(timeEntry, updateDto);

    // Recalculate duration if times were updated
    if (updateDto.startTime || updateDto.endTime) {
      timeEntry.calculateDuration();
    }

    return await this.timeEntryRepository.save(timeEntry);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const timeEntry = await this.findOne(id, tenantId);

    // Only allow deletion of draft entries
    if (!timeEntry.canEdit()) {
      throw new BadRequestException('Can only delete draft time entries');
    }

    await this.timeEntryRepository.softDelete(id);
  }

  async submit(id: string, tenantId: string): Promise<TimeEntry> {
    const timeEntry = await this.findOne(id, tenantId);

    if (!timeEntry.canSubmit()) {
      throw new BadRequestException('Time entry cannot be submitted');
    }

    if (!timeEntry.endTime) {
      throw new BadRequestException('End time is required to submit');
    }

    timeEntry.status = TimeEntryStatus.SUBMITTED;

    return await this.timeEntryRepository.save(timeEntry);
  }

  async approve(
    id: string,
    approverId: string,
    tenantId: string,
  ): Promise<TimeEntry> {
    const timeEntry = await this.findOne(id, tenantId);

    if (!timeEntry.canApprove()) {
      throw new BadRequestException('Time entry cannot be approved');
    }

    timeEntry.status = TimeEntryStatus.APPROVED;
    timeEntry.approvedBy = approverId;
    timeEntry.approvedAt = new Date();

    return await this.timeEntryRepository.save(timeEntry);
  }

  async reject(
    id: string,
    reason: string,
    approverId: string,
    tenantId: string,
  ): Promise<TimeEntry> {
    const timeEntry = await this.findOne(id, tenantId);

    if (timeEntry.status !== TimeEntryStatus.SUBMITTED) {
      throw new BadRequestException('Can only reject submitted time entries');
    }

    timeEntry.status = TimeEntryStatus.REJECTED;
    timeEntry.rejectionReason = reason;
    timeEntry.approvedBy = approverId;
    timeEntry.approvedAt = new Date();

    return await this.timeEntryRepository.save(timeEntry);
  }

  async getWeeklySummary(userId: string, weekStart: Date, tenantId: string) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const entries = await this.timeEntryRepository.find({
      where: {
        userId,
        tenantId,
        entryDate: Between(weekStart, weekEnd),
      },
    });

    const totalMinutes = entries.reduce(
      (sum, entry) => sum + (entry.durationMinutes || 0),
      0,
    );

    return {
      weekStart,
      weekEnd,
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60,
      entries: entries.length,
      billableHours: Math.floor(
        entries
          .filter((e) => e.isBillable)
          .reduce((sum, e) => sum + (e.durationMinutes || 0), 0) / 60,
      ),
    };
  }
}
