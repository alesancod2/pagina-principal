import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('associations')
export class Association {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (u) => u.association)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'plan_name', length: 100 })
  planName: string;

  @Column({ name: 'plan_type', length: 50 })
  planType: string;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'overdue', 'cancelled'], default: 'active' })
  status: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'vehicle_plate', length: 10, nullable: true })
  vehiclePlate: string;

  @Column({ name: 'vehicle_model', length: 100, nullable: true })
  vehicleModel: string;

  @Column({ name: 'is_compliant', default: true })
  isCompliant: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
