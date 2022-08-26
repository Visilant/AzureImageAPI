import { Router } from 'express';
import { writeExcel } from '../../../infra/WriteExcel';
import ConnectDatabase from '../../../infra/OpenMRS';

export = () => {
    const router = Router();

    const mysql = ConnectDatabase();

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

    const setNull = (obj: any, val: any) => {
        Object.keys(obj).forEach(k => obj[k] = val);
        return obj
    }

    const getDiagnosis = (value: any) => {
        let doctor = {
            [`matureCataractRightEC${value}`]: 0,
            [`matureCataractLeftEC${value}`]: 0,
            [`immatureCataractRightEC${value}`]: 0,
            [`immatureCataractLeftEC${value}`]: 0,
            [`pterygiumRightEC${value}`]: 0,
            [`pterygiumLeftEC${value}`]: 0,
            [`conjunctivitisRightEC${value}`]: 0,
            [`conjunctivitisLeftEC${value}`]: 0,
            [`subconjunctivalhemorrhageRightEC${value}`]: 0,
            [`subconjunctivalhemorrhageLeftEC${value}`]: 0,
            [`cornealAbrasionRightEC${value}`]: 0,
            [`cornealAbrasionLeftEC${value}`]: 0,
            [`inactiveCornealOpacityRightEC${value}`]: 0,
            [`inactiveCornealOpacityLeftEC${value}`]: 0,
            [`activeCornealInfectionRightEC${value}`]: 0,
            [`activeCornealInfectionLeftEC${value}`]: 0,
            [`normalEyeExamRightEC${value}`]: 0,
            [`normalEyeExamLeftEC${value}`]: 0,
            [`refractiveErrorPresbyopiaRightEC${value}`]: 0,
            [`refractiveErrorPresbyopiaLeftEC${value}`]: 0,
            [`posteriorSegmentSuspectedRightEC${value}`]: 0,
            [`posteriorSegmentSuspectedLeftEC${value}`]: 0,
            [`pseudophakiaRightEC${value}`]: 0,
            [`pseudophakiaLeftEC${value}`]: 0,
            [`cannotBeAssessedRightEC${value}`]: 0,
            [`cannotBeAssessedLeftEC${value}`]: 0,
            OtherdiagnosisRight: '',
            OtherdiagnosisLeft: '',


            [`ReferralEC${value}`]: 0,
            [`ReferralLocationEC${value}`]: '',
            [`ReferralTimingEC${value}`]: ''
        }
        if (value === 0) {
            doctor = {
                ...doctor,
                [`visualAcuityRightEC${value}`]: '',
                [`visualAcuityLeftEC${value}`]: '',
                [`pinholeRightEC${value}`]: '',
                [`pinholeLeftEC${value}`]: '',

                [`blurryVisionUpCloseRightEC${value}`]: 0,
                [`blurryVisionUpCloseLeftEC${value}`]: 0,
                [`blurryVisionFarRightEC${value}`]: 0,
                [`blurryVisionFarLeftEC${value}`]: 0,
                [`rednessRightEC${value}`]: 0,
                [`rednessLeftEC${value}`]: 0,
                [`eyePainRightEC${value}`]: 0,
                [`eyePainLeftEC${value}`]: 0,
                [`headacheRightEC${value}`]: 0,
                [`headacheLeftEC${value}`]: 0,
                [`eyeTraumaRightEC${value}`]: 0,
                [`eyeTraumaLeftEC${value}`]: 0,
                otherComplaintRight: '',
                otherComplaintLeft: '',
            }
        }
        return doctor;
    }


    const getAdultinitialData = () => {
        let nurse = {
            blurryVisionCloseRightNurse: 0,
            blurryVisionCloseLeftNurse: 0,
            blurryVisionFarRightNurse: 0,
            blurryVisionFarLeftNurse: 0,
            rednessRightNurse: 0,
            rednessLeftNurse: 0,
            eyePainRightNurse: 0,
            headacheRightNurse: 0,
            headacheLeftNurse: 0,
            eyeTraumaRightNurse: 0,
            eyeTraumaLeftNurse: 0,
            pcIOLRightNurse: 0,
            pcIOLLeftNurse: 0,
            otherComplaintRight: '',
            otherComplaintLeft: '',
            volunteerVARight: '',
            volunteerVALeft: '',
            volunteerPinholeRight: '',
            volunteerPinholeLeft: '',
            volunteerReferral: 0
        }
        return nurse;
    }


    const getEncounter = (encounter: any, type: any) => {
        return new Promise((resolve) => {
            let doctorReview = getDiagnosis(type), eyecamp = '';
            encounter.obs.forEach((ob: any) => {
                if ([165204, 165207, 165205, 165206].includes(ob.concept_id)) {
                    var firstWord = ob.obs_value.split(' ')[0].toLowerCase() + (ob.obs_value.split(' ')[1]?.toLowerCase() || '');
                    let key = Object.keys(doctorReview);
                    let p1 = new RegExp(`^${firstWord}`);
                    if ([165204, 165205].includes(ob.concept_id)) {
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
                } else if ([165196, 165197].includes(ob.concept_id)) {
                    if (ob.obs_value.toLowerCase() !== 'no') {
                        doctorReview[`ReferralEC${type}`] = 1
                        const location = ob.obs_value.split('to ')[1];
                        doctorReview[`ReferralLocationEC${type}`] = location;
                    }
                } else if ([165198, 165199].includes(ob.concept_id)) {
                    const time = ob.obs_value.split('in ')[1];
                    doctorReview[`ReferralTimingEC${type}`] = time;
                } else if (ob.concept_id === 165214) {
                    let { acuity, pinhole, complaint, diagnosis, referral, ophthalmologist } = JSON.parse(ob.obs_value)
                    if (acuity) {
                        doctorReview[`visualAcuityLeftEC${type}`] = acuity.left;
                        doctorReview[`visualAcuityRightEC${type}`] = acuity.right;
                    }
                    if (pinhole) {
                        doctorReview[`pinholeLeftEC${type}`] = pinhole.left
                        doctorReview[`pinholeRightEC${type}`] = pinhole.right
                    }
                    if (complaint) {
                        if (complaint.left !== '') {
                            var firstWord = complaint.left.split(' ')[0].toLowerCase() + (complaint.left.split(' ')[1]?.toLowerCase() || '') + (complaint.left.split(' ')[2]?.toLowerCase() || '');
                            let key = Object.keys(doctorReview);
                            let p1 = new RegExp(`^${firstWord}`);
                            let lefteye = key.filter(ab => ab.toLowerCase().match('left') && p1.test(ab.toLowerCase()));
                            if (lefteye.length) {
                                doctorReview[lefteye[0]] = 1;
                            } else {
                                doctorReview['otherComplaintLeft'] = complaint.left;
                            }
                        }
                        if (complaint.right !== '') {
                            var firstWord = complaint.right.split(' ')[0].toLowerCase() + (complaint.right.split(' ')[1]?.toLowerCase() || '') + (complaint.right.split(' ')[2]?.toLowerCase() || '');
                            let key = Object.keys(doctorReview);
                            let p1 = new RegExp(`^${firstWord}`);
                            let righteye = key.filter(ab => ab.toLowerCase().match('right') && p1.test(ab.toLowerCase()));
                            if (righteye.length) {
                                doctorReview[righteye[0]] = 1;
                            } else {
                                doctorReview['otherComplaintRight'] = complaint.right;
                            }
                        }
                    }
                    if (diagnosis) {
                        if (diagnosis.left !== '') {
                            var firstWord = diagnosis.left.split(' ')[0].toLowerCase() + (diagnosis.left.replace('/', '').split(' ')[1]?.toLowerCase() || '');
                            let key = Object.keys(doctorReview);
                            let p1 = new RegExp(`^${firstWord}`);
                            let lefteye = key.filter(ab => ab.toLowerCase().match('left') && p1.test(ab.toLowerCase()));
                            if (lefteye.length) {
                                doctorReview[lefteye[0]] = 1;
                            } else {
                                doctorReview['OtherdiagnosisLeft'] = diagnosis.left;
                            }
                        }
                        if (diagnosis.right !== '') {
                            var firstWord = diagnosis.right.split(' ')[0].toLowerCase() + (diagnosis.right.replace('/', '').split(' ')[1]?.toLowerCase() || '');
                            let key = Object.keys(doctorReview);
                            let p1 = new RegExp(`^${firstWord}`);
                            let righteye = key.filter(ab => ab.toLowerCase().match('right') && p1.test(ab.toLowerCase()));
                            if (righteye.length) {
                                doctorReview[righteye[0]] = 1;
                            } else {
                                doctorReview['OtherdiagnosisRight'] = diagnosis.right;
                            }
                        }
                    }
                    if (referral) {
                        if (referral.value !== '' && referral.value.toLowerCase() !== 'no') {
                            doctorReview[`ReferralEC${type}`] = 1
                            const location = referral.value.split('to ')[1];
                            doctorReview[`ReferralLocationEC${type}`] = location;
                            if (referral.time !== '') {
                                const time = referral.time.split('in ')[1];
                                doctorReview[`ReferralTimingEC${type}`] = time;
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
                    nurseReview['volunteerVARight'] = ob.obs_value;
                } else if (ob.concept_id === 165190) {
                    nurseReview['volunteerVALeft'] = ob.obs_value;
                } else if (ob.concept_id === 165191) {
                    nurseReview['volunteerPinholeRight'] = ob.obs_value;
                } else if (ob.concept_id === 165192) {
                    nurseReview['volunteerPinholeLeft'] = ob.obs_value;
                } else if (ob.concept_id === 165193) {
                    if (ob.obs_value.toLowerCase() !== 'no.' && ob.obs_value.toLowerCase() !== 'no') {
                        nurseReview['volunteerReferral'] = 1;
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
     * 165185 Left Eye Diagnosis
     * 165186 Right Eye Diagnosis
     * 
     * @description Review 1
     * 165196 Referral 
     * 165198 Referral Time
     * 165204 Left Eye Diagnosis
     * 165207 Right Eye Diagnosis
     * 
     * @description Review 2
     * 165197 Referral
     * 165199 Referral Time
     * 165205 Left Eye Diagnosis
     * 165206 Right Eye Diagnosis
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
            and o.concept_id IN (165183, 165184, 165185, 165186, 
                165214, 
                165196, 165198, 165204, 165207, 
                165197, 165199, 165205, 165206, 
                165189, 165190, 165192, 165191, 165195, 165193, 165223, 165224)
            and o.voided = 0
            GROUP BY e.patient_id`, (err: any, results: any) => {
                if (err) console.log('Error', err)
                if (results.length) {
                    let datas: any = [];
                    for (let i = 0; i < results.length; i++) {
                        let { patient_id, person_uuid, gender, dob, visits, encounters_type_id, encounters, encounter_date, concepts, obs, uuid } = results[i];
                        try {
                            visits = JSON.parse(visits);
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
                    }).then((responses: any) => {
                        const newData: any = [];
                        responses.forEach((response: any) => {
                            let data = {
                                patinet_uuid: response.patient_uuid,
                                gender: response.gender,
                                age: response.age,
                                adultInitialEncounterDate: response.nurse.adultinitial_date,
                                "Eye Camp Ophthalmologist name": response.eyecampreview.eyecamp,
                                Doctor1ID: response.review1.creator_uuid,
                                Doctor2ID: response.review2.creator_uuid,
                                Doctor3ID: response.review3.creator_uuid,
                                nurseID: response.nurse.nurse_id
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
                            newData.push(data);
                        })
                        writeExcel(newData, 'review').then((response: any) => {
                            res.status(200).json({ total: datas.length, filepath: `${process.env.SERVER_DOMAIN}:${process.env.PORT}/${response.filepath}` })
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