import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity()
/**
 * Shit register entity
 */
export class ShitRegister {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column('text')
    user!: string;

  @Column('text')
    username!: string;

  @Column('text')
    chat!: string;

  @Column('datetime')
    createdAt!: Date;
}
