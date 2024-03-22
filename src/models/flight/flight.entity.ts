import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class FlightCache {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  searchHash: string;

  @Column()
  sessionToken: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
