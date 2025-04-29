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

@Entity()
export class FlightHistoryPrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  searchHash: string;

  @Column({
    nullable: true,
    type: 'float',
  })
  price?: number | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity()
export class TripDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cityEnityId: string;

  @Column()
  editHash: string;

  @Column({ type: 'jsonb', nullable: true })
  trip: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
