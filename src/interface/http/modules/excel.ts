import e, { Router } from 'express';
import { writeExcel } from '../../../infra/WriteExcel';
import ConnectDatabase from '../../../infra/OpenMRS';
import { ImageEntity } from '../../../entity/ImageEntity';

export = () => {
    const router = Router();

    const mysql = ConnectDatabase();

    /**
     * Function to get age from sql date
     * @param dateString string
     * @returns age
     */
    const getAge = (dateString: string) => {
        var today = new Date();
        var birthDate = new Date(dateString);
        var age = today.getFullYear() - birthDate.getFullYear();
        var m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    /**
     * Function to set null when there is no information available
     * @param obj 
     * @param val 
     * @returns 
     */
    const setNull = (obj: any, val: any) => {
        Object.keys(obj).forEach(k => obj[k] = val);
        return obj
    }

    /**
     * Filter the best image quality
     * @param data array
     * @returns string
     */
    const getImageQuality = (data = []) => {
        let efficient = '';
        if (data.length) {
            let optimal = data.filter((image: any) => image.efficient === "optimal");
            let acceptable = data.filter((image: any) => image.efficient === "acceptable");
            let poor = data.filter((image: any) => image.efficient === "poor");
            // console.log(optimal, acceptable, poor)
            if (optimal.length) {
                efficient = 'optimal'
            } else if (acceptable.length) {
                efficient = 'acceptable'
            } else if (poor.length) {
                efficient = 'poor'
            }
        }
        return efficient;
    }

    /**
     * Fetch Image Quality of a patient visit
     * @param patient_id string
     * @param visit_id string
     * @returns object
     */

    const getImage = (patient_id: string, visit_id: string) => {
        return new Promise((resolve) => {
            let efficient = {
                imageQualityLeft: '',
                imageQualityRight: ''
            }
            try {
                ImageEntity.find({ where: { patient_id, visit_id } }).then(resp => {
                    if (resp.length) {
                        let leftEye: any = resp.filter(image => image.type === 'left')
                        let righttEye: any = resp.filter(image => image.type === 'right')
                        efficient.imageQualityLeft = getImageQuality(leftEye)
                        efficient.imageQualityRight = getImageQuality(righttEye)
                        resolve(efficient)
                    } else {
                        resolve(efficient)
                    }
                })
            } catch (err) {
                resolve(efficient)
            }
        })
    }

    /**
     * Function to set excel column
     * @description All json are processed in sequence
     * @param responses array
     * @returns array of json
     */
    const getAllInfo = (responses: any) => {
        return new Promise(resolve => {
            const newData: any = [];
            responses.forEach(async (response: any, index: number) => {
                let imageQuality: any = await getImage(response.patient_uuid, response.visit_uuid);
                let data: any = {
                    patinet_uuid: response.patient_uuid,
                    gender: response.gender,
                    age: response.age,
                    adultInitialEncounterDate: response.nurse.adultinitial_date,
                    "Eye Camp Ophthalmologist name": response.eyecampreview.eyecamp,
                    RO1_id: response.review1.creator_uuid,
                    RO2_id: response.review2.creator_uuid,
                    RO3_id: response.review3.creator_uuid,
                    CHW_id: response.nurse.nurse_id
                }
                if (Object.keys(response.eyecampreview.review).length) {
                    data = {
                        ...data,
                        ...response.eyecampreview.review,
                    }
                } else {
                    data = {
                        ...data,
                        ...setNull(getDiagnosis(0), '')
                    }
                } if (Object.keys(response.review1.review).length) {
                    data = {
                        ...data,
                        ...response.review1.review,
                    }
                } else {
                    data = {
                        ...data,
                        ...setNull(getDiagnosis(1), '')
                    }
                } if (Object.keys(response.review2.review).length) {
                    data = {
                        ...data,
                        ...response.review2.review,
                    }
                } else {
                    data = {
                        ...data,
                        ...setNull(getDiagnosis(2), '')
                    }
                } if (Object.keys(response.review3.review).length) {
                    data = {
                        ...data,
                        ...response.review3.review,
                    }
                } else {
                    data = {
                        ...data,
                        ...setNull(getDiagnosis(3), '')
                    }
                } if (Object.keys(response.nurse.review).length) {
                    data = {
                        ...data,
                        ...response.nurse.review,
                    }
                } else {
                    data = {
                        ...data,
                        ...setNull(getAdultinitialData(), '')
                    }
                }
                data = {
                    ...data,
                    ...imageQuality
                }
                newData.push(data)
                if (responses.length === index + 1) {
                    setTimeout(() => { resolve(newData) }, 500);
                }
            })
        })
    }

    const getDiagnosis = (value: any) => {
        let doctor = {
            [`matureCataractRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`matureCataractLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`immatureCataractRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`immatureCataractLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`clearCrystallineLensRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`clearCrystallineLensLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`PCIOLRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`PCIOLLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`AphakiaRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`AphakiaLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`refractiveErrorPresbyopiaRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`refractiveErrorPresbyopiaLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`pterygiumRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`pterygiumLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`inactiveCornealOpacityRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`inactiveCornealOpacityLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`activeCornealInfectionRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`activeCornealInfectionLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,

            // [`conjunctivitisRight${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`conjunctivitisLeft${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`subconjunctivalHemorrhageRight${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`subconjunctivalHemorrhageLeft${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`presbyopiaRight${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`presbyopiaLeft${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`posteriorSegmentScreeningRight${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`posteriorSegmentScreeningLeft${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`cannotBeAssessedRight${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`cannotBeAssessedLeft${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            OtherdiagnosisRight: '',
            OtherdiagnosisLeft: '',

            // [`cornealAbrasionRight${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`cornealAbrasionLeft${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,

            // [`normalEyeExamRight${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`normalEyeExamLeft${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,

            // [`posteriorSegmentSuspectedRight${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`posteriorSegmentSuspectedLeft${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`pseudophakiaRight${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            // [`pseudophakiaLeft${ value === 0 ? `EC${value}` : `RO${value}`}`]: 0,



            [`Referral${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
            [`ReferralLocation${value === 0 ? `EC${value}` : `RO${value}`}`]: '',
            [`ReferralTiming${value === 0 ? `EC${value}` : `RO${value}`}`]: ''
        }
        if (value === 0) {
            doctor = {
                ...doctor,
                [`visualAcuityRight${value === 0 ? `EC${value}` : `RO${value}`}`]: '',
                [`visualAcuityLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: '',
                [`pinholeRight${value === 0 ? `EC${value}` : `RO${value}`}`]: '',
                [`pinholeLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: '',

                [`blurryVisionUpCloseRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
                [`blurryVisionUpCloseLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
                [`blurryVisionFarRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
                [`blurryVisionFarLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
                [`rednessRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
                [`rednessLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
                [`eyePainOrIrritationRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
                [`eyePainOrIrritationLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
                [`headacheRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
                [`headacheLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
                [`eyeTraumaRight${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
                [`eyeTraumaLeft${value === 0 ? `EC${value}` : `RO${value}`}`]: 0,
                otherComplaintRight: '',
                otherComplaintLeft: '',
            }
        }
        return doctor;
    }


    const getAdultinitialData = () => {
        let nurse = {
            blurryVisionCloseRightCHW: 0,
            blurryVisionCloseLeftCHW: 0,
            blurryVisionFarRightCHW: 0,
            blurryVisionFarLeftCHW: 0,
            rednessRightCHW: 0,
            rednessLeftCHW: 0,
            eyePainRightCHW: 0,
            eyePainLeftCHW: 0,
            headacheRightCHW: 0,
            headacheLeftCHW: 0,
            eyeTraumaRightCHW: 0,
            eyeTraumaLeftCHW: 0,
            // pcIOLRightCHW: 0,
            // pcIOLLeftCHW: 0,
            otherComplaintRight: '',
            otherComplaintLeft: '',
            VARightCHW: '',
            VALeftCHW: '',
            PinholeRightCHW: '',
            PinholeLeftCHW: '',
            ReferralCHW: 0
        }
        return nurse;
    }


    const getEncounter = (encounter: any, type: any) => {
        return new Promise((resolve) => {
            let doctorReview = getDiagnosis(type), eyecamp = '';
            encounter.obs.forEach((ob: any) => {
                if ([165185, 165186, 165226, 165204, 165207, 165205, 165206, 165225, 165227, 165228, 165229, 165230].includes(ob.concept_id)) {
                    var firstWord = ob.obs_value.split(' ')[0].toLowerCase() + (ob.obs_value.split(' ')[1]?.toLowerCase() || '');
                    let key = Object.keys(doctorReview);
                    let p1 = new RegExp(`^${firstWord}`);
                    if ([165185, 165204, 165205, 165226, 165227, 165228].includes(ob.concept_id)) {
                        let lefteye = key.filter(ab => ab.toLowerCase().match('left') && p1.test(ab.toLowerCase()));
                        if (lefteye.length) {
                            doctorReview[lefteye[0]] = 1;
                        } else {
                            doctorReview['OtherdiagnosisLeft'] = ob.obs_value;
                        }
                    } else {
                        let rightEye = key.filter(ab => ab.toLowerCase().match('right') && p1.test(ab.toLowerCase()));
                        if (rightEye.length) {
                            doctorReview[rightEye[0]] = 1;
                        } else {
                            doctorReview['OtherdiagnosisRight'] = ob.obs_value;
                        }
                    }
                } else if ([165183, 165196, 165197].includes(ob.concept_id)) {
                    if (ob.obs_value.toLowerCase() !== 'no') {
                        doctorReview[`Referral${type === 0 ? `EC${type}` : `DC${type}`}`] = 1
                        const location = ob.obs_value.split('to ')[1];
                        doctorReview[`ReferralLocation${type === 0 ? `EC${type}` : `DC${type}`}`] = location;
                    }
                } else if ([165184, 165198, 165199].includes(ob.concept_id)) {
                    const time = ob.obs_value.split('in ')[1];
                    doctorReview[`ReferralTiming${type === 0 ? `EC${type}` : `DC${type}`}`] = time;
                } else if (ob.concept_id === 165214) {
                    let { acuity, pinhole, complaint, diagnosis, lens, referral, ophthalmologist } = JSON.parse(ob.obs_value)
                    if (acuity) {
                        doctorReview[`visualAcuityLeft${type === 0 ? `EC${type}` : `DC${type}`}`] = acuity.left;
                        doctorReview[`visualAcuityRight${type === 0 ? `EC${type}` : `DC${type}`}`] = acuity.right;
                    }
                    if (pinhole) {
                        doctorReview[`pinholeLeft${type === 0 ? `EC${type}` : `DC${type}`}`] = pinhole.left
                        doctorReview[`pinholeRight${type === 0 ? `EC${type}` : `DC${type}`}`] = pinhole.right
                    }
                    if (complaint) {
                        if (typeof complaint.left === 'object' && complaint.left.length) {
                            complaint.left.forEach((com: string) => {
                                var firstWord = com.split(' ')[0].toLowerCase() + (com.split(' ')[1]?.toLowerCase() || '') + (com.split(' ')[2]?.toLowerCase() || '');
                                let key = Object.keys(doctorReview);
                                let p1 = new RegExp(`^${firstWord}`);
                                // console.log(firstWord, p1)
                                let lefteye = key.filter(ab => ab.toLowerCase().match('left') && p1.test(ab.toLowerCase()));
                                if (lefteye.length) {
                                    doctorReview[lefteye[0]] = 1;
                                } else {
                                    doctorReview['otherComplaintLeft'] = com;
                                }
                            })

                        }
                        if (typeof complaint.right === 'object' && complaint.right.length) {
                            complaint.right.forEach((com: string) => {
                                var firstWord = com.split(' ')[0].toLowerCase() + (com.split(' ')[1]?.toLowerCase() || '') + (com.split(' ')[2]?.toLowerCase() || '');
                                let key = Object.keys(doctorReview);
                                let p1 = new RegExp(`^${firstWord}`);
                                let righteye = key.filter(ab => ab.toLowerCase().match('right') && p1.test(ab.toLowerCase()));
                                if (righteye.length) {
                                    doctorReview[righteye[0]] = 1;
                                } else {
                                    doctorReview['otherComplaintRight'] = com;
                                }
                            })
                        }
                    }
                    if (diagnosis) {
                        if (typeof diagnosis.left === 'object' && diagnosis.left.length) {
                            diagnosis.left.forEach((dia: string) => {
                                var firstWord = dia.split(' ')[0].toLowerCase() + (dia.replace('/', '').split(' ')[1]?.toLowerCase() || '');
                                let key = Object.keys(doctorReview);
                                let p1 = new RegExp(`^${firstWord}`);
                                let lefteye = key.filter(ab => ab.toLowerCase().match('left') && p1.test(ab.toLowerCase()));
                                if (lefteye.length) {
                                    doctorReview[lefteye[0]] = 1;
                                } else {
                                    doctorReview['OtherdiagnosisLeft'] = dia;
                                }
                            })

                        }
                        if (typeof diagnosis.right === 'object' && diagnosis.right.length) {
                            diagnosis.right.forEach((dia: string) => {
                                var firstWord = dia.split(' ')[0].toLowerCase() + (dia.replace('/', '').split(' ')[1]?.toLowerCase() || '');
                                let key = Object.keys(doctorReview);
                                let p1 = new RegExp(`^${firstWord}`);
                                let righteye = key.filter(ab => ab.toLowerCase().match('right') && p1.test(ab.toLowerCase()));
                                if (righteye.length) {
                                    doctorReview[righteye[0]] = 1;
                                } else {
                                    doctorReview['OtherdiagnosisRight'] = dia;
                                }
                            })
                        }
                    }
                    if (lens) {
                        if (lens.left !== '') {
                            var firstWord = lens.left.split(' ')[0].toLowerCase() + (lens.left.replace('/', '').split(' ')[1]?.toLowerCase() || '');
                            let key = Object.keys(doctorReview);
                            let p1 = new RegExp(`^${firstWord}`);
                            let lefteye = key.filter(ab => ab.toLowerCase().match('left') && p1.test(ab.toLowerCase()));
                            if (lefteye.length) {
                                doctorReview[lefteye[0]] = 1;
                            }
                        }
                        if (lens.right !== '') {
                            var firstWord = lens.right.split(' ')[0].toLowerCase() + (lens.right.replace('/', '').split(' ')[1]?.toLowerCase() || '');
                            let key = Object.keys(doctorReview);
                            let p1 = new RegExp(`^${firstWord}`);
                            let righteye = key.filter(ab => ab.toLowerCase().match('right') && p1.test(ab.toLowerCase()));
                            if (righteye.length) {
                                doctorReview[righteye[0]] = 1;
                            }
                        }
                    }
                    if (referral) {
                        if (referral.value !== '' && referral.value.toLowerCase() !== 'no') {
                            doctorReview[`Referral${type === 0 ? `EC${type}` : `DC${type}`}`] = 1
                            const location = referral.value.split('to ')[1];
                            doctorReview[`ReferralLocation${type === 0 ? `EC${type}` : `DC${type}`}`] = location;
                            if (referral.time !== '') {
                                const time = referral.time;
                                doctorReview[`ReferralTiming${type === 0 ? `EC${type}` : `DC${type}`}`] = time;
                            }
                        }
                    } if (ophthalmologist) {
                        eyecamp = ophthalmologist;
                    }
                }
            });
            resolve({ doctorReview, eyecamp });
        })
    }

    const getAdultinitial = (encounter: any) => {
        return new Promise((resolve) => {
            let nurseReview: any = getAdultinitialData();
            encounter.obs.forEach((ob: any) => {
                if (ob.concept_id === 165223 || ob.concept_id === 165224) {
                    var firstWord = ob.obs_value.split(' ')[0].toLowerCase() + (ob.obs_value.split(' ')[1]?.toLowerCase() || '');
                    let key: any = Object.keys(nurseReview);
                    let p1 = new RegExp(`^${firstWord}`);
                    if (ob.concept_id === 165223) {
                        let rightEye = key.filter((ab: any) => ab.toLowerCase().match('right') && p1.test(ab.toLowerCase()));
                        if (rightEye.length) {
                            nurseReview[rightEye[0]] = 1;
                        } else {
                            nurseReview['otherComplaintRight'] = ob.obs_value;
                        }
                    } else {
                        let lefteye = key.filter((ab: any) => ab.toLowerCase().match('left') && p1.test(ab.toLowerCase()));
                        if (lefteye.length) {
                            nurseReview[lefteye[0]] = 1;
                        } else {
                            nurseReview['otherComplaintLeft'] = ob.obs_value;
                        }
                    }
                } else if (ob.concept_id === 165189) {
                    nurseReview['VARightCHW'] = ob.obs_value;
                } else if (ob.concept_id === 165190) {
                    nurseReview['VALeftCHW'] = ob.obs_value;
                } else if (ob.concept_id === 165191) {
                    nurseReview['PinholeRightCHW'] = ob.obs_value;
                } else if (ob.concept_id === 165192) {
                    nurseReview['PinholeLeftCHW'] = ob.obs_value;
                } else if (ob.concept_id === 165193) {
                    if (ob.obs_value.toLowerCase() !== 'no.' && ob.obs_value.toLowerCase() !== 'no') {
                        nurseReview['ReferralCHW'] = 1;
                    }
                }
            })
            resolve(nurseReview);
        })
    }

    /**
     * Get All data for excel Sheet
     * 
     * @description Eye Camp
     * 165214 Eye camp
     * 
     * @description All concept id are:
     * 165183 Referral
     * 165184 Referral Time
     * 165185 Left Eye Lens Diagnosis
     * 165186 Right Eye Lens Diagnosis
     * 165226 Left Eye Pathology Diagnosis
     * 165225 Right Eye Pathology Diagnosis
     * 
     * @description Review 1
     * 165196 Referral 
     * 165198 Referral Time
     * 165204 Left Eye Diagnosis Lens Diagnosis
     * 165207 Right Eye Diagnosis Lens Diagnosis
     * 165227 Left Eye Pathology Diagnosis
     * 165229 Right Eye Pathology Diagnosis
     * 
     * @description Review 2
     * 165197 Referral
     * 165199 Referral Time
     * 165205 Left Eye Diagnosis Lens Diagnosis
     * 165206 Right Eye Diagnosis Lens Diagnosis
     * 165228 Left Eye Pathology Diagnosis
     * 165230 Right Eye Pathology Diagnosis
     * 
     * @description Complaint
     * 165189 VA right
     * 165190 VA left
     * 165192 PH left
     * 165191 PH right
     * 
     * 165195 Volunter referral reason
     * 165193 Volunter referral
     * 165223 complaint right
     * 165224 complaint left
     */
    router.get('/download', (req: any, res: any) => {
        let { from, to } = req.query;
        if (!from && !to) {
            res.status(200).json({ message: 'Select date range' });
            return true;
        }
        try {
            mysql.query(`select e.patient_id, 
            JSON_ARRAYAGG(pe.uuid) as person_uuid,
            JSON_ARRAYAGG(v.uuid) as visit_uuid,
            JSON_ARRAYAGG(pe.gender) as gender,
            JSON_ARRAYAGG(pe.birthdate) as dob,
            JSON_ARRAYAGG(e.visit_id) as visits,
            JSON_ARRAYAGG(e.encounter_type) as encounters_type_id,  
            JSON_ARRAYAGG(e.encounter_id) as encounters, 
            JSON_ARRAYAGG(e.encounter_datetime) as encounter_date, 
            JSON_ARRAYAGG(o.concept_id) as concepts,
            JSON_ARRAYAGG(o.value_text) as obs,
            JSON_ARRAYAGG(o.creator) as creator,
            JSON_ARRAYAGG(pro.uuid) as uuid
            from openmrs.visit as v
            join openmrs.encounter as e on e.visit_id = v.visit_id
            join openmrs.obs as o on o.encounter_id = e.encounter_id
            join openmrs.users as u on u.user_id = e.creator
            join openmrs.provider as pro on pro.person_id = u.person_id
            join openmrs.person as pe on pe.person_id = v.patient_id
            where e.encounter_type IN (1, 9, 17, 18, 20, 21)
            and v.date_created between ${from} and ${to}
            and o.concept_id IN (
                165183, 165184, 165185, 165186, 165226, 165225,
                165214, 
                165196, 165198, 165204, 165207, 165227, 165229,
                165197, 165199, 165205, 165206, 165228, 165230,
                165189, 165190, 165192, 165191, 165195, 165193, 165223, 165224
                )
            and o.voided = 0
            GROUP BY e.patient_id`, (err: any, results: any) => {
                if (err) console.log('Error', err)
                if (results.length) {
                    let datas: any = [];
                    for (let i = 0; i < results.length; i++) {
                        let { patient_id, person_uuid, visit_uuid, gender, dob, visits, encounters_type_id, encounters, encounter_date, concepts, obs, uuid } = results[i];
                        try {
                            visits = JSON.parse(visits);
                            visit_uuid = JSON.parse(visit_uuid),
                                encounters_type_id = JSON.parse(encounters_type_id);
                            encounters = JSON.parse(encounters);
                            encounter_date = JSON.parse(encounter_date);
                            concepts = JSON.parse(concepts);
                            obs = JSON.parse(obs);
                            uuid = JSON.parse(uuid);
                            person_uuid = JSON.parse(person_uuid);
                            gender = JSON.parse(gender);
                            dob = JSON.parse(dob);
                        } catch (err) {
                            res.status(400).json({ message: 'Exception at parse: ', err })
                        }
                        for (let j = 0; j < visits.length; j++) {
                            let lastVisit = datas[datas.length - 1]?.visits;
                            let lastEncounter = lastVisit?.encounters.length - 1;
                            if (lastVisit?.visit_id === visits[j] && lastVisit?.encounters[lastEncounter]?.encounter_date === encounter_date[j]) {
                                lastVisit.encounters[lastEncounter].obs.push({
                                    concept_id: concepts[j],
                                    obs_value: obs[j]
                                })
                            } else {
                                if (lastVisit?.visit_id === visits[j] && lastVisit?.encounters[lastEncounter]?.encounters_type_id !== encounters_type_id[j]) {
                                    lastVisit.encounters.push({
                                        encounters_type_id: encounters_type_id[j],
                                        encounter_id: encounters[j],
                                        encounter_date: encounter_date[j],
                                        creator_uuid: uuid[j],
                                        obs: [{
                                            concept_id: concepts[j],
                                            obs_value: obs[j]
                                        }]
                                    })
                                } else {
                                    datas.push({
                                        person: {
                                            id: patient_id,
                                            uuid: person_uuid[j],
                                            gender: gender[j].toLowerCase() === 'male' || gender[j].toLowerCase() === 'm' ? 'M' : 'F',
                                            age: getAge(dob[j])
                                        },
                                        visits: {
                                            visit_uuid: visit_uuid[j],
                                            visit_id: visits[j],
                                            encounters: [{
                                                encounters_type_id: encounters_type_id[j],
                                                encounter_id: encounters[j],
                                                encounter_date: encounter_date[j],
                                                creator_uuid: uuid[j],
                                                obs: [{
                                                    concept_id: concepts[j],
                                                    obs_value: obs[j]
                                                }]
                                            }]
                                        }
                                    });
                                }
                            }
                        }
                    }
                    new Promise(resolve => {
                        let visit: any = [];
                        datas.forEach((data: any, dataIndex: number) => {
                            let reviews = {
                                visit_uuid: data.visits.visit_uuid,
                                patient_uuid: data.person.uuid,
                                gender: data.person.gender,
                                age: data.person.age,
                                nurse: {
                                    adultinitial_date: '',
                                    nurse_id: '',
                                    review: {}
                                },
                                eyecampreview: {
                                    creator_uuid: '',
                                    review: {},
                                    eyecamp: ''
                                },
                                review1: {
                                    creator_uuid: '',
                                    review: {}
                                },
                                review2: {
                                    creator_uuid: '',
                                    review: {}
                                },
                                review3: {
                                    creator_uuid: '',
                                    review: {}
                                }
                            };
                            data.visits.encounters.forEach(async (encounter: any) => {
                                if ([9, 17, 18, 21].includes(encounter.encounters_type_id)) {
                                    if (encounter.encounters_type_id === 9) {
                                        let data: any = await getEncounter(encounter, 1);
                                        reviews.review1.review = data.doctorReview
                                        reviews.review1.creator_uuid = encounter.creator_uuid;
                                    } else if (encounter.encounters_type_id === 17) {
                                        let data: any = await getEncounter(encounter, 2);
                                        reviews.review2.review = data.doctorReview
                                        reviews.review2.creator_uuid = encounter.creator_uuid;
                                    } else if (encounter.encounters_type_id === 18) {
                                        let data: any = await getEncounter(encounter, 3);
                                        reviews.review3.review = data.doctorReview;
                                        reviews.review3.creator_uuid = encounter.creator_uuid;
                                    } else if (encounter.encounters_type_id === 21) {
                                        let data: any = await getEncounter(encounter, 0);
                                        reviews.eyecampreview.review = data.doctorReview;
                                        reviews.eyecampreview.eyecamp = data.eyecamp;
                                        reviews.eyecampreview.creator_uuid = encounter.creator_uuid;
                                    }
                                }
                                if (encounter.encounters_type_id === 1) {
                                    let data: any = await getAdultinitial(encounter);
                                    reviews.nurse.review = data;
                                    reviews.nurse.adultinitial_date = encounter.encounter_date;
                                    reviews.nurse.nurse_id = encounter.creator_uuid;
                                }
                            })
                            visit.push(reviews);
                            if (datas.length === dataIndex + 1) {
                                resolve(visit);
                            }
                        })
                    }).then(async (responses: any) => {
                        let newData: any = await getAllInfo(responses);
                        writeExcel(newData, 'review').then((response: any) => {
                            res.status(200).json({ total: newData.length, filepath: `${process.env.SERVER_DOMAIN}:${process.env.PORT}/${response.filepath}` })
                        })
                    })
                } else {
                    res.status(200).json({ message: 'No Visit' })
                }
            })
        } catch (err) {
            res.status(400).json({ message: 'Exception in data query: ', err })
        }
    })

    return router;
}