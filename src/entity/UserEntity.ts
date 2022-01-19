import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class UserEntity extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string = '';

    @Column()
    first_name: string = '';

    @Column()
    last_name: string = '';

    @Column({ unique: true })
    email: string = '';

    @Column()
    password: string = '';

    @Column()
    created_by: string = '';

    @CreateDateColumn()
    created_at: string = '';

}