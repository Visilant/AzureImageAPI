import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('image')
export class ImageEntity extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string = '';

    @Column()
    visit_id: string = '';

    @Column()
    patient_id: string = '';

    @Column()
    image_path: string = '';

    @Column()
    created_by: string = '';

    @Column({nullable: true})
    efficient: string = '';

    @CreateDateColumn()
    created_at: string = '';

}