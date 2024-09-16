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
  price?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
