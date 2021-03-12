const express = require('express')
const { Kafka } = require('kafkajs')

const app = express()
const port = 3000
const kafka = new Kafka({
    clientId: "app",
    brokers:["kafka:9092","kafka2:9092"]
})

app.get('/', (req, res) => {
    res.send('Hello World!!!!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    const consumer = kafka.consumer({
        groupId: "express"        
    });
    const run = async () => {
        await consumer.connect();
        await consumer.subscribe({topic: "test", fromBeginning: true});
        await consumer.run({
            eachMessage: async ({topic, partition, message}) => {
                const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
                console.log(`- ${prefix} ${message.key}#${message.value}`)
            }
        })
    }

    run().catch(e => console.error(`[example/consumer] ${e.message}`, e))

const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes.map(type => {
  process.on(type, async e => {
    try {
      console.log(`process.on ${type}`)
      console.error(e)
      await consumer.disconnect()
      process.exit(0)
    } catch (_) {
      process.exit(1)
    }
  })
})

signalTraps.map(type => {
  process.once(type, async () => {
    try {
      await consumer.disconnect()
    } finally {
      process.kill(process.pid, type)
    }
  })
})
})