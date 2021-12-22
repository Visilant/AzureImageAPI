import { Entity, BaseEntity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum ImageType {
    RIGHT = "right",
    LEFT = "left"
}

export enum Quality {
    NONE = '',
    POOR = 'poor',
    ACCEPTABLE = 'acceptable',
    OPTIMAL = 'optimal'
}
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

    @Column({ nullable: true})
    visual_acuity: string = '';

    @Column({ nullable: true})
    pinhole_acuity: string = '';

    @Column({ nullable: true})
    complaints: string = '';

    @Column({ nullable: true})
    age: string = '';

    @Column({ nullable: true})
    sex: string = '';

    @Column()
    created_by: string = '';

    @Column({ nullable: true, type: 'enum', enum: Quality })
    efficient: Quality = Quality.NONE;

    @Column({ type: 'enum', enum: ImageType })
    type: ImageType = ImageType.LEFT;

    @CreateDateColumn()
    created_at: string = '';

}