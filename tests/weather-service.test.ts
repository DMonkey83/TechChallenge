import { getWeatherData } from "../services/weather-service";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

describe("WeatherService", () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  it("returns degreeDays for valid string response", async () => {
    mock.onGet(/\/weather/).reply(200, {
      location: {
        location: "Severn Valley (Filton)",
        degreeDays: "1835",
        groundTemp: "10.6",
        postcode: "BS7",
        lat: "51.507864",
        lng: "-2.576467",
      },
    });
    const result = await getWeatherData("Severn Valley (Filton)");
    expect(result).toBe(1835);
  });

  it("returns degreeDays for valid number response", async () => {
    mock.onGet(/\/weather/).reply(200, {
      location: {
        location: "Test Region",
        degreeDays: 1835,
        groundTemp: "10.6",
        postcode: "BS7",
        lat: "51.507864",
        lng: "-2.576467",
      },
    });
    const result = await getWeatherData("Test Region");
    expect(result).toBe(1835);
  });

  it("returns null for invalid degreeDays string", async () => {
    mock.onGet(/\/weather/).reply(200, {
      location: {
        location: "Test Region",
        degreeDays: "invalid",
        groundTemp: "10.6",
        postcode: "BS7",
        lat: "51.507864",
        lng: "-2.576467",
      },
    });
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    const result = await getWeatherData("Test Region");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid or missing degreeDays for Test Region")
    );
    consoleSpy.mockRestore();
  });

  it("returns null for missing degreeDays", async () => {
    mock.onGet(/\/weather/).reply(200, {
      location: {
        location: "Test Region",
        groundTemp: "10.6",
        postcode: "BS7",
        lat: "51.507864",
        lng: "-2.576467",
      },
    });
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    const result = await getWeatherData("Test Region");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid or missing degreeDays for Test Region")
    );
    consoleSpy.mockRestore();
  });

  it("returns null for null degreeDays", async () => {
    mock.onGet(/\/weather/).reply(200, {
      location: {
        location: "Test Region",
        degreeDays: null,
        groundTemp: "10.6",
        postcode: "BS7",
        lat: "51.507864",
        lng: "-2.576467",
      },
    });
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
    const result = await getWeatherData("Test Region");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Invalid or missing degreeDays for Test Region")
    );
    consoleSpy.mockRestore();
  });

  it("returns null for 404 error", async () => {
    mock.onGet(/\/weather/).reply(404, { error: "Unknown Location" });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    const result = await getWeatherData("North-Eastern (Leeming)");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Error fetching weather data for North-Eastern (Leeming)"
      )
    );
    consoleSpy.mockRestore();
  });

  it("retries on 500 error and returns degreeDays on success", async () => {
    mock
      .onGet(/\/weather/)
      .replyOnce(500, { error: "Server error" })
      .onGet(/\/weather/)
      .reply(200, {
        location: {
          location: "Thames Valley (Heathrow)",
          degreeDays: "2033",
          groundTemp: "11.3",
          postcode: "TW6",
          lat: "51.470022",
          lng: "-0.454296",
        },
      });
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const result = await getWeatherData("Thames Valley (Heathrow)");
    expect(result).toBe(2033);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Retrying request to /weather?location=Thames%20Valley%20(Heathrow) (Attempt 1/3)"
      )
    );
    consoleSpy.mockRestore();
  });

  it("retries on 500 error and returns null after max retries", async () => {
    mock.onGet(/\/weather/).reply(500, { error: "Server error" });
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    const result = await getWeatherData("Test Region");
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Retrying request")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Attempt 1/3")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Attempt 2/3")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Attempt 3/3")
    );
    consoleSpy.mockRestore();
  });
});
