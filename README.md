//TODO
- Add the serviceDetails method
- Create example projects (list services at a station, list specific service details)
- Pull out the response parsing into an injectable class that we can swap out if the service changes
- More comprehensive test cases. Ideally some services with cancellations / diversions / service splits and joins.
- Explain the tests and the test stubs. How to use it for expanding darwin-ldb-node
- Maybe: automatically generate Types from the WSDL service description (did attempt this but I found that the service as described does not match the actual responses...)

# darwin-ldb-node

A helper module using Typescript and Jest to make the Live Departure Boards Web Service (LDBWS / OpenLDBWS) SOAP interface more user friendly [link](https://lite.realtime.nationalrail.co.uk/OpenLDBWS/)

For example we can request arrivals and departures for trains from NCL (Newcastle) to King's Cross like so:

```ts
const darwin = await Darwin.make()

const result = await darwin.arrivalsAndDepartures({
    crs: 'NCL',
    filterCrs: 'KGX',
    filterType: 'to',
})

const firstService = result.trainServices.pop()
const scheduledTimeOfDeparture = firstService?.std ?? "??:??" // "10:00"

console.log(`The ${scheduledTimeOfDeparture} train from Newcastle to King\'s Cross calls at:`)

const callingPoints = firstService?.callingPoints.to.KGX ?? [] as CallingPointLocation[]
callingPoints.forEach( location => {
    const{ st, et, at, locationName } = location
    console.log(`${st} (${et ?? at}) ${locationName}`) 
})

// The 10:00 train from Newcastle to King's Cross calls at:
// 10:15 (10:17) Darlington
// 10:40 (on time) York
// 11:50 (on time) Peterborough
// ... and so on
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
		<service:GetArrDepBoardWithDetailsRequest>
			<service:numRows>10</service:numRows>
			<service:crs>KGX</service:crs>
		</service:GetArrDepBoardWithDetailsRequest>
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
		<GetArrDepBoardWithDetailsResponse
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
				<lt4:generatedAt>2023-01-26T23:42:34.0780815+00:00</lt4:generatedAt>
				<lt4:locationName>London Kings Cross</lt4:locationName>
				<lt4:crs>KGX</lt4:crs>
				<lt4:platformAvailable>true</lt4:platformAvailable>
				<lt8:trainServices>
					<lt8:service>
						<lt4:std>23:42</lt4:std>
						<lt4:etd>On time</lt4:etd>
						<lt4:operator>Great Northern</lt4:operator>
						<lt4:operatorCode>GN</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>250026KNGX____</lt4:serviceID>
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
						<lt8:subsequentCallingPoints>
							<lt8:callingPointList>
								<lt8:callingPoint>
									<lt8:locationName>Letchworth Garden City</lt8:locationName>
									<lt8:crs>LET</lt8:crs>
									<lt8:st>00:09</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Royston</lt8:locationName>
									<lt8:crs>RYS</lt8:crs>
									<lt8:st>00:19</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Cambridge</lt8:locationName>
									<lt8:crs>CBG</lt8:crs>
									<lt8:st>00:36</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
							</lt8:callingPointList>
						</lt8:subsequentCallingPoints>
					</lt8:service>
					<lt8:service>
						<lt4:sta>23:44</lt4:sta>
						<lt4:eta>On time</lt4:eta>
						<lt4:platform>8</lt4:platform>
						<lt4:operator>Thameslink</lt4:operator>
						<lt4:operatorCode>TL</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>255011KNGX____</lt4:serviceID>
						<lt5:rsid>TL000500</lt5:rsid>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>Peterborough</lt4:locationName>
								<lt4:crs>PBO</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:destination>
						<lt8:previousCallingPoints>
							<lt8:callingPointList>
								<lt8:callingPoint>
									<lt8:locationName>Peterborough</lt8:locationName>
									<lt8:crs>PBO</lt8:crs>
									<lt8:st>22:24</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Huntingdon</lt8:locationName>
									<lt8:crs>HUN</lt8:crs>
									<lt8:st>22:40</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>St Neots</lt8:locationName>
									<lt8:crs>SNO</lt8:crs>
									<lt8:st>22:48</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Sandy</lt8:locationName>
									<lt8:crs>SDY</lt8:crs>
									<lt8:st>22:56</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Biggleswade</lt8:locationName>
									<lt8:crs>BIW</lt8:crs>
									<lt8:st>23:00</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Arlesey</lt8:locationName>
									<lt8:crs>ARL</lt8:crs>
									<lt8:st>23:05</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Hitchin</lt8:locationName>
									<lt8:crs>HIT</lt8:crs>
									<lt8:st>23:11</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Stevenage</lt8:locationName>
									<lt8:crs>SVG</lt8:crs>
									<lt8:st>23:17</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Finsbury Park</lt8:locationName>
									<lt8:crs>FPK</lt8:crs>
									<lt8:st>23:38</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
							</lt8:callingPointList>
						</lt8:previousCallingPoints>
					</lt8:service>
					<lt8:service>
						<lt4:std>23:52</lt4:std>
						<lt4:etd>On time</lt4:etd>
						<lt4:platform>5</lt4:platform>
						<lt4:operator>Thameslink</lt4:operator>
						<lt4:operatorCode>TL</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>250038KNGX____</lt4:serviceID>
						<lt5:rsid>TL211200</lt5:rsid>
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
						<lt8:subsequentCallingPoints>
							<lt8:callingPointList>
								<lt8:callingPoint>
									<lt8:locationName>Finsbury Park</lt8:locationName>
									<lt8:crs>FPK</lt8:crs>
									<lt8:st>23:57</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Potters Bar</lt8:locationName>
									<lt8:crs>PBR</lt8:crs>
									<lt8:st>00:12</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Hatfield</lt8:locationName>
									<lt8:crs>HAT</lt8:crs>
									<lt8:st>00:18</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Welwyn Garden City</lt8:locationName>
									<lt8:crs>WGC</lt8:crs>
									<lt8:st>00:23</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Welwyn North</lt8:locationName>
									<lt8:crs>WLW</lt8:crs>
									<lt8:st>00:31</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Knebworth</lt8:locationName>
									<lt8:crs>KBW</lt8:crs>
									<lt8:st>00:35</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Stevenage</lt8:locationName>
									<lt8:crs>SVG</lt8:crs>
									<lt8:st>00:39</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Hitchin</lt8:locationName>
									<lt8:crs>HIT</lt8:crs>
									<lt8:st>00:47</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Letchworth Garden City</lt8:locationName>
									<lt8:crs>LET</lt8:crs>
									<lt8:st>00:53</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Baldock</lt8:locationName>
									<lt8:crs>BDK</lt8:crs>
									<lt8:st>00:56</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Ashwell &amp; Morden</lt8:locationName>
									<lt8:crs>AWM</lt8:crs>
									<lt8:st>01:01</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Royston</lt8:locationName>
									<lt8:crs>RYS</lt8:crs>
									<lt8:st>01:05</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Meldreth</lt8:locationName>
									<lt8:crs>MEL</lt8:crs>
									<lt8:st>01:09</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Shepreth</lt8:locationName>
									<lt8:crs>STH</lt8:crs>
									<lt8:st>01:13</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Foxton</lt8:locationName>
									<lt8:crs>FXN</lt8:crs>
									<lt8:st>01:15</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Cambridge</lt8:locationName>
									<lt8:crs>CBG</lt8:crs>
									<lt8:st>01:25</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
							</lt8:callingPointList>
						</lt8:subsequentCallingPoints>
					</lt8:service>
					<lt8:service>
						<lt4:sta>23:52</lt4:sta>
						<lt4:eta>On time</lt4:eta>
						<lt4:operator>Thameslink</lt4:operator>
						<lt4:operatorCode>TL</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>255147KNGX____</lt4:serviceID>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>Cambridge</lt4:locationName>
								<lt4:crs>CBG</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:destination>
						<lt8:previousCallingPoints>
							<lt8:callingPointList>
								<lt8:callingPoint>
									<lt8:locationName>Cambridge</lt8:locationName>
									<lt8:crs>CBG</lt8:crs>
									<lt8:st>22:27</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Foxton</lt8:locationName>
									<lt8:crs>FXN</lt8:crs>
									<lt8:st>22:36</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Shepreth</lt8:locationName>
									<lt8:crs>STH</lt8:crs>
									<lt8:st>22:39</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Meldreth</lt8:locationName>
									<lt8:crs>MEL</lt8:crs>
									<lt8:st>22:42</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Royston</lt8:locationName>
									<lt8:crs>RYS</lt8:crs>
									<lt8:st>22:47</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Ashwell &amp; Morden</lt8:locationName>
									<lt8:crs>AWM</lt8:crs>
									<lt8:st>22:51</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Baldock</lt8:locationName>
									<lt8:crs>BDK</lt8:crs>
									<lt8:st>22:56</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Letchworth Garden City</lt8:locationName>
									<lt8:crs>LET</lt8:crs>
									<lt8:st>23:00</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Hitchin</lt8:locationName>
									<lt8:crs>HIT</lt8:crs>
									<lt8:st>23:04</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Stevenage</lt8:locationName>
									<lt8:crs>SVG</lt8:crs>
									<lt8:st>23:10</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Knebworth</lt8:locationName>
									<lt8:crs>KBW</lt8:crs>
									<lt8:st>23:13</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Welwyn North</lt8:locationName>
									<lt8:crs>WLW</lt8:crs>
									<lt8:st>23:18</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Welwyn Garden City</lt8:locationName>
									<lt8:crs>WGC</lt8:crs>
									<lt8:st>23:23</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Hatfield</lt8:locationName>
									<lt8:crs>HAT</lt8:crs>
									<lt8:st>23:27</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Potters Bar</lt8:locationName>
									<lt8:crs>PBR</lt8:crs>
									<lt8:st>23:33</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Finsbury Park</lt8:locationName>
									<lt8:crs>FPK</lt8:crs>
									<lt8:st>23:46</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
							</lt8:callingPointList>
						</lt8:previousCallingPoints>
					</lt8:service>
					<lt8:service>
						<lt4:sta>23:59</lt4:sta>
						<lt4:eta>On time</lt4:eta>
						<lt4:operator>Thameslink</lt4:operator>
						<lt4:operatorCode>TL</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>255125KNGX____</lt4:serviceID>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>Cambridge</lt4:locationName>
								<lt4:crs>CBG</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:destination>
						<lt8:previousCallingPoints>
							<lt8:callingPointList>
								<lt8:callingPoint>
									<lt8:locationName>Cambridge</lt8:locationName>
									<lt8:crs>CBG</lt8:crs>
									<lt8:st>22:53</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Royston</lt8:locationName>
									<lt8:crs>RYS</lt8:crs>
									<lt8:st>23:09</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Baldock</lt8:locationName>
									<lt8:crs>BDK</lt8:crs>
									<lt8:st>23:17</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Letchworth Garden City</lt8:locationName>
									<lt8:crs>LET</lt8:crs>
									<lt8:st>23:21</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Hitchin</lt8:locationName>
									<lt8:crs>HIT</lt8:crs>
									<lt8:st>23:26</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Stevenage</lt8:locationName>
									<lt8:crs>SVG</lt8:crs>
									<lt8:st>23:32</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Finsbury Park</lt8:locationName>
									<lt8:crs>FPK</lt8:crs>
									<lt8:st>23:52</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
							</lt8:callingPointList>
						</lt8:previousCallingPoints>
					</lt8:service>
					<lt8:service>
						<lt4:sta>00:08</lt4:sta>
						<lt4:eta>On time</lt4:eta>
						<lt4:operator>Great Northern</lt4:operator>
						<lt4:operatorCode>GN</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>264440KNGX____</lt4:serviceID>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>Ely</lt4:locationName>
								<lt4:crs>ELY</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:destination>
						<lt8:previousCallingPoints>
							<lt8:callingPointList>
								<lt8:callingPoint>
									<lt8:locationName>Ely</lt8:locationName>
									<lt8:crs>ELY</lt8:crs>
									<lt8:st>22:46</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Waterbeach</lt8:locationName>
									<lt8:crs>WBC</lt8:crs>
									<lt8:st>22:56</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Cambridge North</lt8:locationName>
									<lt8:crs>CMB</lt8:crs>
									<lt8:st>23:01</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Cambridge</lt8:locationName>
									<lt8:crs>CBG</lt8:crs>
									<lt8:st>23:14</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Royston</lt8:locationName>
									<lt8:crs>RYS</lt8:crs>
									<lt8:st>23:29</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
							</lt8:callingPointList>
						</lt8:previousCallingPoints>
					</lt8:service>
					<lt8:service>
						<lt4:sta>00:18</lt4:sta>
						<lt4:eta>On time</lt4:eta>
						<lt4:operator>Thameslink</lt4:operator>
						<lt4:operatorCode>TL</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>12</lt4:length>
						<lt4:serviceID>255020KNGX____</lt4:serviceID>
						<lt5:rsid>TL001400</lt5:rsid>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>Peterborough</lt4:locationName>
								<lt4:crs>PBO</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:destination>
						<lt8:previousCallingPoints>
							<lt8:callingPointList>
								<lt8:callingPoint>
									<lt8:locationName>Peterborough</lt8:locationName>
									<lt8:crs>PBO</lt8:crs>
									<lt8:st>22:54</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>12</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Huntingdon</lt8:locationName>
									<lt8:crs>HUN</lt8:crs>
									<lt8:st>23:10</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>12</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>St Neots</lt8:locationName>
									<lt8:crs>SNO</lt8:crs>
									<lt8:st>23:18</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>12</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Sandy</lt8:locationName>
									<lt8:crs>SDY</lt8:crs>
									<lt8:st>23:26</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>12</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Biggleswade</lt8:locationName>
									<lt8:crs>BIW</lt8:crs>
									<lt8:st>23:30</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>12</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Arlesey</lt8:locationName>
									<lt8:crs>ARL</lt8:crs>
									<lt8:st>23:35</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>12</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Hitchin</lt8:locationName>
									<lt8:crs>HIT</lt8:crs>
									<lt8:st>23:44</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>12</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Stevenage</lt8:locationName>
									<lt8:crs>SVG</lt8:crs>
									<lt8:st>23:50</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>12</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Finsbury Park</lt8:locationName>
									<lt8:crs>FPK</lt8:crs>
									<lt8:st>00:10</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>12</lt8:length>
								</lt8:callingPoint>
							</lt8:callingPointList>
						</lt8:previousCallingPoints>
					</lt8:service>
					<lt8:service>
						<lt4:std>00:33</lt4:std>
						<lt4:etd>On time</lt4:etd>
						<lt4:operator>Great Northern</lt4:operator>
						<lt4:operatorCode>GN</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>281263KNGX____</lt4:serviceID>
						<lt5:rsid>GN108000</lt5:rsid>
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
						<lt8:subsequentCallingPoints>
							<lt8:callingPointList>
								<lt8:callingPoint>
									<lt8:locationName>Finsbury Park</lt8:locationName>
									<lt8:crs>FPK</lt8:crs>
									<lt8:st>00:38</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Stevenage</lt8:locationName>
									<lt8:crs>SVG</lt8:crs>
									<lt8:st>01:03</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Hitchin</lt8:locationName>
									<lt8:crs>HIT</lt8:crs>
									<lt8:st>01:12</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Letchworth Garden City</lt8:locationName>
									<lt8:crs>LET</lt8:crs>
									<lt8:st>01:18</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Baldock</lt8:locationName>
									<lt8:crs>BDK</lt8:crs>
									<lt8:st>01:21</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Royston</lt8:locationName>
									<lt8:crs>RYS</lt8:crs>
									<lt8:st>01:29</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Cambridge</lt8:locationName>
									<lt8:crs>CBG</lt8:crs>
									<lt8:st>01:44</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
							</lt8:callingPointList>
						</lt8:subsequentCallingPoints>
					</lt8:service>
					<lt8:service>
						<lt4:sta>00:46</lt4:sta>
						<lt4:eta>On time</lt4:eta>
						<lt4:operator>Thameslink</lt4:operator>
						<lt4:operatorCode>TL</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>255029KNGX____</lt4:serviceID>
						<lt5:rsid>TL001500</lt5:rsid>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>Peterborough</lt4:locationName>
								<lt4:crs>PBO</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:destination>
						<lt8:previousCallingPoints>
							<lt8:callingPointList>
								<lt8:callingPoint>
									<lt8:locationName>Peterborough</lt8:locationName>
									<lt8:crs>PBO</lt8:crs>
									<lt8:st>23:20</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Huntingdon</lt8:locationName>
									<lt8:crs>HUN</lt8:crs>
									<lt8:st>23:34</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>St Neots</lt8:locationName>
									<lt8:crs>SNO</lt8:crs>
									<lt8:st>23:42</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Sandy</lt8:locationName>
									<lt8:crs>SDY</lt8:crs>
									<lt8:st>23:50</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Biggleswade</lt8:locationName>
									<lt8:crs>BIW</lt8:crs>
									<lt8:st>23:53</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Arlesey</lt8:locationName>
									<lt8:crs>ARL</lt8:crs>
									<lt8:st>23:58</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Hitchin</lt8:locationName>
									<lt8:crs>HIT</lt8:crs>
									<lt8:st>00:07</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Stevenage</lt8:locationName>
									<lt8:crs>SVG</lt8:crs>
									<lt8:st>00:13</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Finsbury Park</lt8:locationName>
									<lt8:crs>FPK</lt8:crs>
									<lt8:st>00:40</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
							</lt8:callingPointList>
						</lt8:previousCallingPoints>
					</lt8:service>
					<lt8:service>
						<lt4:sta>00:58</lt4:sta>
						<lt4:eta>On time</lt4:eta>
						<lt4:operator>Thameslink</lt4:operator>
						<lt4:operatorCode>TL</lt4:operatorCode>
						<lt4:serviceType>train</lt4:serviceType>
						<lt4:length>8</lt4:length>
						<lt4:serviceID>250043KNGX____</lt4:serviceID>
						<lt5:rsid>TL211500</lt5:rsid>
						<lt5:origin>
							<lt4:location>
								<lt4:locationName>Cambridge</lt4:locationName>
								<lt4:crs>CBG</lt4:crs>
							</lt4:location>
						</lt5:origin>
						<lt5:destination>
							<lt4:location>
								<lt4:locationName>London Kings Cross</lt4:locationName>
								<lt4:crs>KGX</lt4:crs>
							</lt4:location>
						</lt5:destination>
						<lt8:previousCallingPoints>
							<lt8:callingPointList>
								<lt8:callingPoint>
									<lt8:locationName>Cambridge</lt8:locationName>
									<lt8:crs>CBG</lt8:crs>
									<lt8:st>23:35</lt8:st>
									<lt8:at>On time</lt8:at>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Foxton</lt8:locationName>
									<lt8:crs>FXN</lt8:crs>
									<lt8:st>23:44</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Shepreth</lt8:locationName>
									<lt8:crs>STH</lt8:crs>
									<lt8:st>23:47</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Meldreth</lt8:locationName>
									<lt8:crs>MEL</lt8:crs>
									<lt8:st>23:50</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Royston</lt8:locationName>
									<lt8:crs>RYS</lt8:crs>
									<lt8:st>23:55</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Ashwell &amp; Morden</lt8:locationName>
									<lt8:crs>AWM</lt8:crs>
									<lt8:st>23:59</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Baldock</lt8:locationName>
									<lt8:crs>BDK</lt8:crs>
									<lt8:st>00:04</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Letchworth Garden City</lt8:locationName>
									<lt8:crs>LET</lt8:crs>
									<lt8:st>00:08</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Hitchin</lt8:locationName>
									<lt8:crs>HIT</lt8:crs>
									<lt8:st>00:12</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Stevenage</lt8:locationName>
									<lt8:crs>SVG</lt8:crs>
									<lt8:st>00:18</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Knebworth</lt8:locationName>
									<lt8:crs>KBW</lt8:crs>
									<lt8:st>00:21</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Welwyn North</lt8:locationName>
									<lt8:crs>WLW</lt8:crs>
									<lt8:st>00:25</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Welwyn Garden City</lt8:locationName>
									<lt8:crs>WGC</lt8:crs>
									<lt8:st>00:30</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Hatfield</lt8:locationName>
									<lt8:crs>HAT</lt8:crs>
									<lt8:st>00:34</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Potters Bar</lt8:locationName>
									<lt8:crs>PBR</lt8:crs>
									<lt8:st>00:40</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
								<lt8:callingPoint>
									<lt8:locationName>Finsbury Park</lt8:locationName>
									<lt8:crs>FPK</lt8:crs>
									<lt8:st>00:51</lt8:st>
									<lt8:et>On time</lt8:et>
									<lt8:length>8</lt8:length>
								</lt8:callingPoint>
							</lt8:callingPointList>
						</lt8:previousCallingPoints>
					</lt8:service>
				</lt8:trainServices>
			</GetStationBoardResult>
		</GetArrDepBoardWithDetailsResponse>
	</soap:Body>
</soap:Envelope>
```

</details>

# Usage

You will need an access token from the LDB service. This is free for reasonable use. You can register [here](http://realtime.nationalrail.co.uk/OpenLDBWSRegistration).

You will need the target service WSDL. At time of writing it's this: `https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2021-11-01`. The [same link](https://lite.realtime.nationalrail.co.uk/OpenLDBWS) minus the wsdl extension also contains documentation and will indicate what the current WSDL is. 

For fastest use simply add the token and url to environment variables:
```
LDB_DARWIN_ACCESS_TOKEN=<your access token here>
LDB_DARWIN_WSDL_URL=https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2021-11-01
```

Now you can instantiate the service like so:

```js
import { Darwin } from 'darwin-ldb-node'

const d = Darwin.make()
await d.init()

const results = await d.arrivalsAndDepartures({crs: 'NCL'})
```

Alternatively you can manually pass the url and access token to the supplied SOAP connector like so:

```js
import { Darwin, SoapConnector } from 'darwin-ldb-node'

const d = new Darwin()
d.connector = new SoapConnector(wsdlUrl, accessToken)
await d.init()

const results = await d.arrivalsAndDepartures({crs: 'NCL'})
```

# Notes

## Stability

`darwin-ldb-node` is written to make requests to and parse responses from the service defined by WSDL `https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2021-11-01`. If this service changes our results may vary and parsing / typing might break.

## Accuracy

This is the same data that actual departure boards in stations use so we can assume we're as accurate as those. How accurate that is to reality is another matter. The consensus seems to be that Darwin is the system to use for examining the schedule. [Darwin](https://wiki.openraildata.com/index.php?title=TRUST_vs_Darwin). [LDB accuracy](https://www.nationalrail.co.uk/times_fares/46467.aspx).

## CRS "Computer reservation system"

This is the three letter station code. For example King's Cross is KGX and Newcastle is NCL. [More info](http://www.railwaycodes.org.uk/crs/crs0.shtm)

## Multiple origins / destinations

It's possible for a service to have multiple origins if two trains were connected during the journey.

Similarly it's possible for a service to have multiple destinations if the drain splits during the journey.

See `TrainService.from.scheduled` object to see the scheduled destinations, where the object keys are the destination CRS. Same format for `to`.

## Multiple callingPoints

As a service can have multiple origins / destinations so to can it have variable calling points.

See the `TrainService.callingPoints.to` object to see all calling points from the current queried board to the destination.

For example if we've queried departures from KGX and a service has a destination of both YRK and NCL due to a train split at York:

```
service.callingPoints.to.YRK // all calling points between KGX and YRK
service.callingPoints.to.NCL // all calling points between KGX and NCL
```

Note that the NCL set contains the YRK set.

Same format for `TrainService.callingPoints.to`.

Note that the order of these array are chronological (ie, the first entry in the 'from' array should be an origin, and the last entry in the 'to' array should be a destination).

## `st`/`sta`/`std` | `et`/`eta`/`etd` | `at`/`ata`/`atd`

s = scheduled (the planned time for this service).

e = estimated (for example if running slightly late).

a = actual (usually available shortly after the train left).

st = scheduled time (the calling points only list the 'time' not the arrival and departure times).

sta = scheduled time of arrival.

std = scheduled time of departure.

Not all services have both. For example a service terminating at the station for which the board query was made will have no departure time.
