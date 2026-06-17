import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Partner } from '../../partners/entities/partner.entity';

export enum BenefitType {
  DISCOUNT_PERCENT = 'discount_percent',
  DISCOUNT_FIXED = 'discount_fixed',
  CASHBACK = 'cashback',
  POINTS = 'points',
  FREEBIE = 'freebie',
}

@Entity('partner_benefits')
export class Benefit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'benefit_type',
    type: 'enum',
    enum: BenefitType,
  })
  benefitType: BenefitType;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercent: number;

  @Column({ name: 'discount_fixed', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountFixed: number;

  @Column({ name: 'cashback_percent', type: 'decimal', precision: 5, scale: 2, nullable: true })
  cashbackPercent: number;

  @Column({ name: 'points_generated', type: 'integer', default: 0 })
  pointsGenerated: number;

  @Column({ name: 'points_required', type: 'integer', default: 0 })
  pointsRequired: number;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'max_uses', type: 'integer', nullable: true })
  maxUses: number;

  @Column({ name: 'max_uses_per_user', type: 'integer', nullable: true })
  maxUsesPerUser: number;

  @Column({ name: 'current_uses', type: 'integer', default: 0 })
  currentUses: number;

  @Column({ name: 'requires_compliance', default: true })
  requiresCompliance: boolean;

  @Column({ name: 'days_available', length: 50, default: '1,2,3,4,5,6,7' })
  daysAvailable: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Partner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;
}
