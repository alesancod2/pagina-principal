import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Partner } from '../../partners/entities/partner.entity';
import { Benefit } from '../../benefits/entities/benefit.entity';

export enum UsageSessionStatus {
  VALIDATED = 'validated',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

@Entity('usage_sessions')
export class UsageSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @Column({ name: 'benefit_id', type: 'uuid', nullable: true })
  benefitId: string;

  @Column({ name: 'qr_payload', length: 50 })
  qrPayload: string;

  @Column({ length: 30, unique: true })
  protocol: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: UsageSessionStatus.VALIDATED,
  })
  status: UsageSessionStatus;

  @Column({ name: 'device_info', length: 255, nullable: true })
  deviceInfo: string;

  @Column({ name: 'points_earned', type: 'integer', default: 0 })
  pointsEarned: number;

  @Column({ name: 'validated_at', type: 'timestamp', default: () => 'NOW()' })
  validatedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client: User;

  @ManyToOne(() => Partner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ManyToOne(() => Benefit, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'benefit_id' })
  benefit: Benefit;
}
