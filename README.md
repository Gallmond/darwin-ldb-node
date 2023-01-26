# darwin-ldb-node

A helper module using Typescript and Jest to make the Live Departure Boards Web Service (LDBWS / OpenLDBWS) SOAP interface more user friendly [link](https://lite.realtime.nationalrail.co.uk/OpenLDBWS/)

For example we can request arrivals and departures for trains from NCL (Newcastle) to King's Cross like so:

```ts
const result = await darwin.arrivalsAndDepartures({
    crs: 'NCL',
    filterCrs: 'KGX',
    filterType: 'to',
})

const firstService = result.trainServices.pop()
const scheduledTimeOfDeparture = firstService?.std // "10:00"

console.log(`The ${scheduledTimeOfDeparture} train from Newcastle to King\'s Cross calls at:`)

const callingPoints = firstService?.callingPoints.to.KGX ?? [] as CallingPointLocation[]
callingPoints.forEach( location => {
    const{ et, at, locationName } = location
    console.log(`${et} (${at}) ${locationName}`) // "10:15 (on time) Darlington"
})
```

Instead of having to manually compose SOAP documents like this:

<details>
    <summary>SOAP request</summary>

```xml
<?xml version="1.0"?>
<SOAP-ENV:Envelope
	xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope"
	xmlns:service="http://thalesgroup.com/RTTI/2021-11-01/ldb/"
	xmlns:types="http://thalesgroup.com/RTTI/2013-11-28/Token/types">
	<SOAP-ENV:Header>
		<types:AccessToken>
			<types:TokenValue>{{token}}</types:TokenValue>
		</types:AccessToken>
	</SOAP-ENV:Header>
	<SOAP-ENV:Body>
		<service:GetDepartureBoardRequest>
			<service:numRows>10</service:numRows>
			<service:crs>KGX</service:crs>
		</service:GetDepartureBoardRequest>
	</SOAP-ENV:Body>
</SOAP-ENV:Envelope>
```

</details>

And parse responses like this:

<details>
    <summary>SOAP response</summary>

```xml
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
	xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
	xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xmlns:xsd="http://www.w3.org/2001/XMLSchema">
	<soap:Body>
		<GetDepartureBoardResponse
			xmlns="http://thalesgroup.com/RTTI/2021-11-01/ldb/">
			<GetStationBoardResult
				xmlns:lt="http://thalesgroup.com/RTTI/2012-01-13/ldb/types"
				xmlns:lt8="http://thalesgroup.com/RTTI/2021-11-01/ldb/types"
				xmlns:lt6="http://thalesgroup.com/RTTI/2017-02-02/ldb/types"
				xmlns:lt7="http://thalesgroup.com/RTTI/2017-10-01/ldb/types"
				xmlns:lt4="http://thalesgroup.com/RTTI/2015-11-27/ldb/types"
				xmlns:lt5="http://thalesgroup.com/RTTI/2016-02-16/ldb/types"
				xmlns:lt2="http://thalesgroup.com/RTTI/2014-02-20/ldb/types"
				xmlns:lt3="http://thalesgroup.com/RTTI/2015-05-14/ldb/types">
				<lt4:generatedAt>2023-01-26T20:37:58.8602415+00:00</lt4:generatedAt>
				<lt4:locationName>London Kings Cross</lt4:locationName>
				<lt4:crs>KGX</lt4:crs>
				<lt4:platformAvailable>true</lt4:platformAvailable>
				<lt8:trainServices>
					<lt8:service>
						<lt4:std>20:39</lt4:std>
						<lt4:etd>On time</lt4:etd>
						<lt4:platform>6</lt4:platform>
						<lt4:operator>Great Northern</lt4:operator>
						<lt4:operatorCode>GN</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>260461KNGX____</lt4:serviceID>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>Kings Lynn</lt4:locationName>
								<lt4:crs>KLN</lt4:crs>
							</lt4:location>
						</lt5:destination>
					</lt8:service>
					<lt8:service>
						<lt4:std>20:52</lt4:std>
						<lt4:etd>On time</lt4:etd>
						<lt4:platform>10</lt4:platform>
						<lt4:operator>Thameslink</lt4:operator>
						<lt4:operatorCode>TL</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>270979KNGX____</lt4:serviceID>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>Cambridge</lt4:locationName>
								<lt4:crs>CBG</lt4:crs>
							</lt4:location>
						</lt5:destination>
					</lt8:service>
					<lt8:service>
						<lt4:std>21:00</lt4:std>
						<lt4:etd>On time</lt4:etd>
						<lt4:operator>London North Eastern Railway</lt4:operator>
						<lt4:operatorCode>GR</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:serviceID>252890KNGX____</lt4:serviceID>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>Newcastle</lt4:locationName>
								<lt4:crs>NCL</lt4:crs>
							</lt4:location>
						</lt5:destination>
					</lt8:service>
					<lt8:service>
						<lt4:std>21:09</lt4:std>
						<lt4:etd>On time</lt4:etd>
						<lt4:operator>Great Northern</lt4:operator>
						<lt4:operatorCode>GN</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>270901KNGX____</lt4:serviceID>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>Ely</lt4:locationName>
								<lt4:crs>ELY</lt4:crs>
							</lt4:location>
						</lt5:destination>
					</lt8:service>
					<lt8:service>
						<lt4:std>21:33</lt4:std>
						<lt4:etd>On time</lt4:etd>
						<lt4:operator>London North Eastern Railway</lt4:operator>
						<lt4:operatorCode>GR</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:serviceID>254714KNGX____</lt4:serviceID>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>Leeds</lt4:locationName>
								<lt4:crs>LDS</lt4:crs>
							</lt4:location>
						</lt5:destination>
					</lt8:service>
					<lt8:service>
						<lt4:std>21:39</lt4:std>
						<lt4:etd>On time</lt4:etd>
						<lt4:operator>Great Northern</lt4:operator>
						<lt4:operatorCode>GN</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>260465KNGX____</lt4:serviceID>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>Kings Lynn</lt4:locationName>
								<lt4:crs>KLN</lt4:crs>
							</lt4:location>
						</lt5:destination>
					</lt8:service>
					<lt8:service>
						<lt4:std>21:52</lt4:std>
						<lt4:etd>On time</lt4:etd>
						<lt4:operator>Thameslink</lt4:operator>
						<lt4:operatorCode>TL</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>270982KNGX____</lt4:serviceID>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>Cambridge</lt4:locationName>
								<lt4:crs>CBG</lt4:crs>
							</lt4:location>
						</lt5:destination>
					</lt8:service>
					<lt8:service>
						<lt4:std>22:00</lt4:std>
						<lt4:etd>On time</lt4:etd>
						<lt4:operator>London North Eastern Railway</lt4:operator>
						<lt4:operatorCode>GR</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:serviceID>252896KNGX____</lt4:serviceID>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>Newcastle</lt4:locationName>
								<lt4:crs>NCL</lt4:crs>
							</lt4:location>
						</lt5:destination>
					</lt8:service>
					<lt8:service>
						<lt4:std>22:09</lt4:std>
						<lt4:etd>On time</lt4:etd>
						<lt4:operator>Great Northern</lt4:operator>
						<lt4:operatorCode>GN</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>270904KNGX____</lt4:serviceID>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>Ely</lt4:locationName>
								<lt4:crs>ELY</lt4:crs>
							</lt4:location>
						</lt5:destination>
					</lt8:service>
				</lt8:trainServices>
			</GetStationBoardResult>
		</GetDepartureBoardResponse>
	</soap:Body>
</soap:Envelope>
```

</details>

