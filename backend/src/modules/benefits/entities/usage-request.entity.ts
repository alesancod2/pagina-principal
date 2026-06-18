import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Partner } from '../../partners/entities/partner.entity';
import { Benefit } from './benefit.entity';

export enum UsageStatus {
  PENDING = 'pendente',
  CONFIRMED = 'confirmado',
  CANCELLED = 'cancelado',
}

@Entity('usage_requests')
export class UsageRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @Column({ name: 'benefit_id', type: 'uuid' })
  benefitId: string;

  @Column({ name: 'usage_code', length: 20 })
  usageCode: string;

  @Column({ type: 'enum', enum: UsageStatus, default: UsageStatus.PENDING })
  status: UsageStatus;

  @Column({ name: 'points_to_credit', type: 'integer', default: 0 })
  pointsToCredit: number;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date;

  @Column({ name: 'confirmed_by', type: 'uuid', nullable: true })
  confirmedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ManyToOne(() => Benefit)
  @JoinColumn({ name: 'benefit_id' })
  benefit: Benefit;
}
