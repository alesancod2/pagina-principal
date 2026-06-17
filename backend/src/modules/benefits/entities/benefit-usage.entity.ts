import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Partner } from '../../partners/entities/partner.entity';
import { Benefit } from './benefit.entity';

@Entity('benefit_usages')
export class BenefitUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @Column({ name: 'benefit_id', type: 'uuid' })
  benefitId: string;

  @Column({ name: 'coupon_id', type: 'uuid', nullable: true })
  couponId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ name: 'discount_applied', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountApplied: number;

  @Column({ name: 'points_earned', type: 'integer', default: 0 })
  pointsEarned: number;

  @Column({ name: 'validated_by', type: 'uuid', nullable: true })
  validatedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'used_at', type: 'timestamp', default: () => 'NOW()' })
  usedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ManyToOne(() => Benefit)
  @JoinColumn({ name: 'benefit_id' })
  benefit: Benefit;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'validated_by' })
  validator: User;
}
