import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Voucher } from './voucher.entity';
import { Partner } from '../../partners/entities/partner.entity';
import { User } from '../../users/entities/user.entity';

@Entity('voucher_usages')
export class VoucherUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voucher_id', type: 'uuid' })
  voucherId: string;

  @Column({ name: 'partner_id', type: 'uuid' })
  partnerId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'used_at', type: 'timestamp', default: () => 'NOW()' })
  usedAt: Date;

  @Column({ name: 'confirmed_by', type: 'uuid', nullable: true })
  confirmedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Voucher, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'voucher_id' })
  voucher: Voucher;

  @ManyToOne(() => Partner)
  @JoinColumn({ name: 'partner_id' })
  partner: Partner;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'confirmed_by' })
  confirmer: User;
}
