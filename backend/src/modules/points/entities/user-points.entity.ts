import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('user_points')
export class UserPoints {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @Column({ type: 'integer', default: 0 })
  balance: number;

  @Column({ name: 'total_earned', type: 'integer', default: 0 })
  totalEarned: number;

  @Column({ name: 'total_redeemed', type: 'integer', default: 0 })
  totalRedeemed: number;

  @Column({ name: 'total_expired', type: 'integer', default: 0 })
  totalExpired: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
