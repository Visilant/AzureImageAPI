import { Between, In, Like } from "typeorm";

export const CustomQuery = (args: any) => {
    let customQ: any = {
        where: {},
        withDeleted: false,
        relations: []
    }
    if (args.withDeleted === 'true') {
        customQ.withDeleted = true
    }
    delete args.withDeleted;
    let relationsField = Object.keys(args);
    relationsField.forEach(query => {
        if (query === 'customQuery') {
            let customString: string = args['customQuery'];
            if (customString.indexOf('(') !== -1) {
                let allRelations = customString.split(',');
                allRelations.forEach(relation => {
                    let innerJoin = relation.split('(');
                    if (innerJoin.length > 1) {
                        let mainTable = innerJoin[0];
                        customQ.relations.push(mainTable);
                        if (innerJoin[1]) {
                            customQ.relations.push(`${mainTable}.${innerJoin[1].replace(/[)]/g, '')}`)
                        }
                    } else {
                        if (customString[customString.indexOf(innerJoin[0]) - 1] === ',' && customString[customString.indexOf(innerJoin[0]) - 2] === ')') {
                            customQ.relations.push(innerJoin[0].replace(/[)]/g, ''))
                        } else if (customQ.relations[0]) {
                            customQ.relations.push(`${customQ.relations[0]}.${innerJoin[0].replace(/[)]/g, '')}`)
                        }
                    }
                })
            } else customQ.relations.push(...customString.split(','));
        } else {
            if (query === 'name') {
                customQ.where = { name: args['name'] }
            } else if (query === 'uuid') {
                customQ.where = { id: args['uuid'] }
            } else if (query === 'skip' || query === 'take') {
                customQ[query] = args[query];
            } else if (customQ.relations.includes(query)) { //check if filter term in relation.
                customQ.where = { [query]: { [args[query].split(':')[0]]: args[query].split(':')[1] } }
            } else if (query === 'created_at' || query === 'modified_at') {
                if (args[query].match(/,/)) {
                    try {
                        let startDate = args[query].split(',')[0];
                        let today = new Date(args[query].split(',')[1]).getTime();
                        today += (3600 * 1000 * 24);
                        let endDate = new Date(today).toLocaleDateString("en-US");
                        customQ.where[query] = Between(startDate, endDate)
                    } catch(e) {
                        console.log('exception on date: ', e)
                    }
                } else {
                    customQ.where[query] = args[query];
                }
            } else if (args[query].match('Like')) { // matches same alike strings
                try {
                    let inside = args[query].split('(')[1].split(')')[0];
                    customQ.where[query] = Like(inside);
                } catch (e) {
                    console.log(e)
                }
            } else if (args[query].match(/,/)) { // To check multiple options in same column
                try {
                    let values = args[query].split(',');
                    if (values.length) {
                        customQ.where[query] = In(values);
                    }
                } catch(e) {
                    console.log(e)
                }
            } else {
                customQ.where[query] = args[query]
            }
        }
    })
    return customQ
}