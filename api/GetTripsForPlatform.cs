using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Xml;
using System.Xml.Serialization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace ChristchurchMetro.Function
{
    public static class GetTripsForPlatform
    {
        private static readonly string BaseUrl = "http://rtt.metroinfo.org.nz/rtt/public/utility/file.aspx?ContentType=SQLXML&Name=JPRoutePositionET2&PlatformNo=";

        [FunctionName("GetTripsForPlatform")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            string platforms = req.Query["platforms"];
            if (string.IsNullOrEmpty(platforms))
            {
                return new BadRequestObjectResult("Required parameter \"platforms\" not present");
            }

            PlatformResponse[] platformResponses = await Task.WhenAll(
                platforms
                    .Split(',')
                    .Select(GetPlatformResponseForPlatformNumber));

            var response = new Response
            {
                Platforms = platformResponses.Where(pr => pr != null).ToList()
            };

            var serializerSettings = new JsonSerializerSettings { ContractResolver = new CamelCasePropertyNamesContractResolver() };
            var json = JsonConvert.SerializeObject(response, serializerSettings);

            return new OkObjectResult(json)
            {
                ContentTypes = new MediaTypeCollection { "application/json" }
            };
        }

        private static async Task<PlatformResponse> GetPlatformResponseForPlatformNumber(string platformNumber)
        {
            var url = BaseUrl + platformNumber;

            try
            {
                using (var client = new HttpClient())
                using (HttpResponseMessage res = await client.GetAsync(url))
                using (HttpContent content = res.Content)
                {
                    var xmlDocument = new XmlDocument();
                    xmlDocument.LoadXml(await content.ReadAsStringAsync());

                    var serializer = new XmlSerializer(typeof(JPRoutePositionET2));
                    var routePosition = (JPRoutePositionET2)serializer.Deserialize(await content.ReadAsStreamAsync());

                    return ConvertPlatformToPlatformResponseObject(platformNumber, routePosition.Platform);
                }
            }
            catch
            {
                return null;
            }
        }

        private static PlatformResponse ConvertPlatformToPlatformResponseObject(string platformNumber, Platform platform)
        {
            var trips = new List<TripResponse>();

            foreach (Route route in platform.Routes)
            {
                foreach (Destination destination in route.Destinations)
                {
                    foreach (Trip trip in destination.Trips)
                    {
                        trips.Add(new TripResponse
                        {
                            Number = route.RouteNo,
                            Name = route.Name,
                            Destination = destination.Name,
                            Eta = trip.ETA
                        });
                    }
                }
            }
            return new PlatformResponse
            {
                PlatformNumber = platformNumber,
                Name = platform.Name,
                Trips = trips
            };
        }

        public class Response
        {
            public List<PlatformResponse> Platforms { get; set; }
        }

        public class PlatformResponse
        {
            public string PlatformNumber { get; set; }
            public string Name { get; set; }
            public List<TripResponse> Trips { get; set; }
        }

        public class TripResponse
        {
            public string Number { get; set; }
            public string Name { get; set; }
            public string Destination { get; set; }
            public string Eta { get; set; }
        }

        [Serializable, XmlRoot(Namespace = "urn:connexionz-co-nz:jp", ElementName = "JPRoutePositionET2")]
        public class JPRoutePositionET2
        {
            public Platform Platform { get; set; }
        }

        [Serializable, XmlRoot(ElementName = "Platform")]
        public class Platform
        {

            [XmlAttribute(AttributeName = "PlatformTag")]
            public string PlatformTag { get; set; }

            [XmlAttribute(AttributeName = "Name")]
            public string Name { get; set; }

            [XmlElement("Route")]
            public List<Route> Routes { get; set; }
        }

        [XmlType("Route")]
        public class Route
        {

            [XmlAttribute(AttributeName = "RouteNo")]
            public string RouteNo { get; set; }

            [XmlAttribute(AttributeName = "Name")]
            public string Name { get; set; }

            [XmlElement("Destination")]
            public List<Destination> Destinations { get; set; }
        }

        [XmlType("Destination")]
        public class Destination
        {

            [XmlAttribute(AttributeName = "Name")]
            public string Name { get; set; }

            [XmlElement("Trip")]
            public List<Trip> Trips { get; set; }
        }

        [XmlType("Trip")]
        public class Trip
        {

            [XmlAttribute(AttributeName = "ETA")]
            public string ETA { get; set; }

            [XmlAttribute(AttributeName = "TripID")]
            public string TripId { get; set; }

            [XmlAttribute(AttributeName = "WheelchairAccess")]
            public bool WheelchairAccess { get; set; }
        }
    }
}
