import { describe, test, expect, beforeAll } from "vitest";
import { Darwin } from "./index.js";
describe('Darwin', () => {
    let token;
    let url;
    beforeAll(() => {
        token = process.env["LDB_DARWIN_ACCESS_TOKEN"];
        url = process.env["LDB_DARWIN_WSDL_URL"];
    });
    test('env variables are set for testing', () => {
        expect(token).toStrictEqual(expect.any(String));
        expect(url).toStrictEqual(expect.any(String));
        expect(token?.length).toBeGreaterThan(0);
        expect(url?.length).toBeGreaterThan(0);
    });
    test('make', async () => {
        const d = await Darwin.make(url, token);
        expect(d).toBeInstanceOf(Darwin);
    }, 5_000);
    test('arrivalsAndDepartures', async () => {
        const d = await Darwin.make(url, token);
        const data = await d.arrivalsAndDepartures({
            crs: 'KGX'
        });
        /**
         * Calling this test at different times of day will yield different results
         * but feels pointless to just test mocked data ¯\_(ツ)_/¯
         */
        const root = data;
        expect(root).toStrictEqual(expect.objectContaining({
            generatedAt: expect.any(Date),
            locationName: 'London Kings Cross',
            crs: 'KGX',
            trainServices: expect.any(Array)
        }));
        const serviceList = root.trainServices;
        expect(serviceList.length).toBeGreaterThan(0);
        for (const service of serviceList) {
            expect(service.serviceID).toBeDefined();
            expect(service.eta).toBeDefined();
            expect(service.etd).toBeDefined();
            expect(service.sta).toBeDefined();
            expect(service.std).toBeDefined();
            expect(service.cancelled).toBeDefined();
            expect(service.platform).toBeDefined();
            expect(service.operator).toBeDefined();
            expect(service.operatorCode).toBeDefined();
            expect(service.to).toBeDefined();
            expect(service.from).toBeDefined();
            expect(service.callingPoints).toBeDefined();
        }
        console.debug('arrivalsAndDepartures data', JSON.stringify(data, null, 2));
    });
    test('serviceDetails', async () => {
        const d = await Darwin.make(url, token);
        const data = await d.arrivalsAndDepartures({
            crs: 'NCL'
        });
        const firstService = data.trainServices.at(0);
        expect(firstService).toBeDefined();
        const serviceData = await d.serviceDetails(firstService?.serviceID ?? '');
        expect(serviceData.generatedAt).toBeDefined(); //: 2025-08-18T20:34:39.906Z,
        expect(serviceData.locationName).toBeDefined(); //: 'Newcastle',
        expect(serviceData.crs).toBeDefined(); //: 'NCL',
        expect(serviceData.operator).toBeDefined(); //: 'Lumo',
        expect(serviceData.operatorCode).toBeDefined(); //: 'LD',
        expect(serviceData.length).toBeDefined(); //: null,
        expect(serviceData.platform).toBeDefined(); //: '6',
        expect(serviceData.alerts).toBeDefined(); //: [],
        expect(serviceData.sta).toBeDefined(); //: '21:32',
        expect(serviceData.eta).toBeDefined(); //: null,
        expect(serviceData.ata).toBeDefined(); //: '21:29',
        expect(serviceData.std).toBeDefined(); //: '21:35',
        expect(serviceData.etd).toBeDefined(); //: 'On time',
        expect(serviceData.atd).toBeDefined(); //: null,
        expect(serviceData.delayReason).toBeDefined(); //: null,
        expect(serviceData.isCancelled).toBeDefined(); //: null,
        expect(serviceData.cancelledReason).toBeDefined(); //: null,
        expect(serviceData.isDiverted).toBeDefined(); //: false,
        expect(serviceData.divertedVia).toBeDefined(); //: null,
        expect(serviceData.diversionReason).toBeDefined(); //: null,
        expect(serviceData.splits).toBeDefined(); //: null,
        expect(serviceData.callingPoints).toBeDefined(); //: { to: { KGX: [Array] }, from: { EDB: [Array] } },
        console.debug('serviceDetails data', JSON.stringify(serviceData, null, 2));
    });
});
//# sourceMappingURL=index.spec.js.map