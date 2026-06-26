import flights from './EGYPTAIR.json' with { type: 'json' };

export const getFlights = (req, res) => {
  const data = flights.map((flight) => ({
    name: flight.flight_name,
      price: flight.ticket_price,
      image: flight.flight_image,
      description: flight.flight_description,
      departureCity: flight.departure_city,
      arrivalCity: flight.arrival_city,
  }));

  res.status(200).json({
    success: true,
    data,
  });
};

export default getFlights;
