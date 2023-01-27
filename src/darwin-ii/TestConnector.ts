import { PlainObj, ConnectorInterface } from './ldb-types'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { createHash } from 'crypto'

class TestConnector implements ConnectorInterface{
    
    initialised = false

    async init(): Promise<void>
    {
        this.initialised = true
    }

    private static getStubFileName(callPath: string, args: PlainObj): string
    {
        const argsHash = createHash( 'md5' )
            .update( JSON.stringify(args) )
            .digest( 'hex' )

        const stubKey = `${callPath}.${argsHash}`

        const path = `${__dirname}/../../tests/data/stubs/${stubKey}.json`

        return path
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
        }catch(error){
            console.error(`failed writing ${fileName}`, {error, callPath, args})
            throw error
        }
    }

    static getStub = (callPath: string, args: PlainObj): PlainObj => 
    {
        const fileName = TestConnector.getStubFileName(callPath, args)

        let data
        try{
            data = readFileSync(fileName, {encoding: 'utf-8'})
        }catch(error){
            console.error(`Error reading ${fileName}`, {error, callPath, args})
            throw error
        }

        return JSON.parse(data) as PlainObj
    }

    async call(callPath: string, args: PlainObj): Promise<unknown>
    {
        return TestConnector.getStub( callPath, args )
    }
}

export default TestConnector