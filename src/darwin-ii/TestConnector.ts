import { PlainObj, ConnectorInterface } from './types'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { createHash } from 'crypto'
import { exit } from 'process'

class TestConnector implements ConnectorInterface{
    
    initialised = false

    async init(): Promise<void>
    {
        this.initialised = true
    }

    private static getStubFileName(callPath: string, args: PlainObj): string
    {
        const hasher = createHash('md5')
        hasher.update( JSON.stringify(args) )

        const argsHash = hasher.digest('hex')
        const stubKey = `${callPath}.${argsHash}`

        return `${__dirname}/../data/stubs/${stubKey}.json`
    }

    static createStub(callPath: string, args: PlainObj, result: PlainObj, overWriteExisting = false){
        const fileData = JSON.stringify(result)
        const fileName = TestConnector.getStubFileName(callPath, args)

        // do not overwrite existing stubs by default
        if(overWriteExisting === false && existsSync(fileName)){
            return
        }

        try{
            writeFileSync(fileName, fileData)
            console.log(`wrote stub ${fileName}`)
        }catch(e){
            console.error(`failed writing ${fileName}`, e)
            throw e
        }
    }

    static getStub = (callPath: string, args: PlainObj): PlainObj => 
    {
        const fileName = TestConnector.getStubFileName(callPath, args)

        let data
        try{
            data = readFileSync(fileName, {encoding: 'utf-8'})
        }catch(e){
            console.error(`Error reading ${fileName}`, e)
            throw e
        }

        return JSON.parse(data) as PlainObj
    }

    async call(callPath: string, args: PlainObj): Promise<unknown>
    {
        return TestConnector.getStub( callPath, args )
    }
}

export default TestConnector