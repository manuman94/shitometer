import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ShitRegister {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  user!: string;

  @Column('datetime')
  createdAt!: Date;
}
