import { BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, JoinColumn, Entity, ManyToMany, OneToMany } from "typeorm";
import { ImageEntity } from "./ImageEntity";

@Entity('diagnosis')
export class DiagnosisEntity extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string = '';

    @Column()
    diagnosis: string = '';

    @Column()
    created_by: string = '';

    @CreateDateColumn()
    created_at: string = '';

    @OneToMany('ImageEntity', (image: ImageEntity) => image.diagnosis, { cascade: true, onDelete: 'CASCADE' })
    images!: ImageEntity[];

}