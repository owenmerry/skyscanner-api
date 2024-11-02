import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class LeaderBoard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  award: 'price-left' | 'stops' | 'round-the-world';

  @Column()
  name: string;

  @Column()
  amount: number;

  @Column({
    nullable: true,
  })
  stops: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  getStopsCount(): number {
    return this.stops.split(',').length;
  }

  getStopOversCount(): number {
    return this.getStopsCount() - 2;
  }
}
