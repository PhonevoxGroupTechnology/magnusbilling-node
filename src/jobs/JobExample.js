const path = require("path");
const { Logger } = require(path.resolve("src/util/logging"));

module.exports = {
    key: 'JobExample',
    config: {limiter: {max: 5, duration: 5 * 1000}},
    async handle(job, done, Queue) {
        job.data._JOB_INTERNAL_ID = `${module.exports.key}:${job.id}`;
        const log = new Logger(`${job.data._JOB_INTERNAL_ID}:User:${cliente.usuario}`, false).useEnvConfig().setJob(job).create()

        log.debug('testing')

        job.progress(100);
        if(job.progress()>=100) {
            done(null, {})
        }
    }
}