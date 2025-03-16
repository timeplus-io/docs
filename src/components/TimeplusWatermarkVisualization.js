import React, { useState, useEffect } from "react";

const TimeplusWatermarkVisualization = () => {
  // Constants for visualization
  const WINDOW_SIZE = 5000; // 5 seconds window size
  const MAX_TIME = 30000; // 30 seconds total simulation time
  const CHART_WIDTH = 800;
  const CHART_HEIGHT = 400;
  const MARGIN = { top: 30, right: 30, bottom: 120, left: 50 };
  const INNER_WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right;
  const INNER_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

  // State
  const [currentTime, setCurrentTime] = useState(0);
  const [watermarkPosition, setWatermarkPosition] = useState(0);
  const [events, setEvents] = useState([]);
  const [windows, setWindows] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed] = useState(1);
  const [step] = useState(500); // Time increment in ms
  const [initialized, setInitialized] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0); // Track frame number for next/prev
  const [frameEvents, setFrameEvents] = useState([]); // Events to show at each frame
  const [lag, setLag] = useState(2000); // Default lag is now 2s
  const [maxEventTime, setMaxEventTime] = useState(0); // Track max event time we've seen

  // Colors from branding
  const colors = {
    gradient: "linear-gradient(314.17deg, #D53F8C 5.89%, #B275FF 95.06%)",
    backgroundDark: "#110F14",
    backgroundMedium: "#19171D",
    backgroundLight: "#2F2D32",
    gray: "#737175",
    pink: "#B83280",
    purple: "#42186D",
    red: "#751025",
    green: "#164C3F",
    yellow: "#97732D",
    orange: "#BF5815",
    blue: "#0B66BC",
    cyan: "#077D95",
  };

  // Initialize and generate sample data
  const initializeData = () => {
    const generateEvents = () => {
      const newEvents = [];

      // In-order events (every 1-2 seconds with exact second boundaries)
      for (
        let t = 0;
        t <= MAX_TIME;
        t += (Math.floor(Math.random() * 2) + 1) * 1000
      ) {
        // Ensure integer timestamps on exact second boundaries
        newEvents.push({
          id: `event-${newEvents.length}`,
          timestamp: t, // Already on exact second boundary
          value: Math.floor(Math.random() * 5) + 1, // Integer value between 1-5
          type: "in-order",
          processedAt: null,
          windowEnd: Math.ceil(t / WINDOW_SIZE) * WINDOW_SIZE,
          sequenceNumber: null, // Will be set later
        });
      }

      // Out-of-order events (10-20% of events arrive out of order, with small delay)
      const outOfOrderCount = Math.floor(
        newEvents.length * (0.1 + Math.random() * 0.1),
      );
      for (let i = 0; i < outOfOrderCount; i++) {
        // Delays are exact seconds
        const delay = (Math.floor(Math.random() * 2) + 1) * 1000;

        // Timestamps on exact second boundaries
        const seconds = Math.floor(Math.random() * (MAX_TIME / 1000 - 5));
        const realTimestamp = seconds * 1000;

        newEvents.push({
          id: `event-out-${i}`,
          timestamp: realTimestamp,
          value: Math.floor(Math.random() * 5) + 1, // Integer value between 1-5
          arrivalTime: realTimestamp + delay,
          type: "out-of-order",
          processedAt: null,
          windowEnd: Math.ceil(realTimestamp / WINDOW_SIZE) * WINDOW_SIZE,
          sequenceNumber: null,
        });
      }

      // Late events (5-10% of events arrive very late)
      const lateCount = Math.floor(
        newEvents.length * (0.05 + Math.random() * 0.05),
      );
      for (let i = 0; i < lateCount; i++) {
        // Late events with exact second delays (3-8 seconds)
        const delay = (Math.floor(Math.random() * 6) + 3) * 1000;

        // Timestamps on exact second boundaries
        const seconds = Math.floor(Math.random() * (MAX_TIME / 1000 - 8));
        const realTimestamp = seconds * 1000;

        newEvents.push({
          id: `event-late-${i}`,
          timestamp: realTimestamp,
          value: Math.floor(Math.random() * 5) + 1, // Integer value between 1-5
          arrivalTime: realTimestamp + delay,
          type: "late",
          processedAt: null,
          isLate: undefined, // Will be determined during processing
          windowEnd: Math.ceil(realTimestamp / WINDOW_SIZE) * WINDOW_SIZE,
          sequenceNumber: null,
        });
      }

      // Sort by arrival time or timestamp for those without arrival time
      const sortedEvents = newEvents.sort((a, b) => {
        const aTime = a.arrivalTime !== undefined ? a.arrivalTime : a.timestamp;
        const bTime = b.arrivalTime !== undefined ? b.arrivalTime : b.timestamp;
        return aTime - bTime;
      });

      // Assign sequence numbers based on arrival order
      sortedEvents.forEach((event, index) => {
        event.sequenceNumber = index + 1;
      });

      return sortedEvents;
    };

    // Generate initial windows
    const generateWindows = () => {
      const newWindows = [];
      for (let t = 0; t < MAX_TIME; t += WINDOW_SIZE) {
        // Using exactly MAX_TIME exclusive
        newWindows.push({
          start: t,
          end: t + WINDOW_SIZE,
          status: "pending", // pending, active, closed
          result: null,
        });
      }
      return newWindows;
    };

    const generatedEvents = generateEvents();
    setEvents(generatedEvents);
    setWindows(generateWindows());

    // Create frames for step-by-step navigation
    const frames = [];
    let currentFrameEvents = [];
    let lastTime = -1;

    generatedEvents.forEach((event) => {
      const arrivalTime =
        event.arrivalTime !== undefined ? event.arrivalTime : event.timestamp;

      // If this event arrives at a new time, create a new frame
      if (arrivalTime > lastTime) {
        if (lastTime >= 0) {
          frames.push({
            time: lastTime,
            events: [...currentFrameEvents],
          });
        }
        lastTime = arrivalTime;
        currentFrameEvents = [event];
      } else {
        currentFrameEvents.push(event);
      }
    });

    // Add the last frame
    if (currentFrameEvents.length > 0) {
      frames.push({
        time: lastTime,
        events: [...currentFrameEvents],
      });
    }

    setFrameEvents(frames);
    setInitialized(true);
  };

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, []);

  // Time progression logic
  useEffect(() => {
    if (!isPlaying || !initialized) return;

    const interval = setInterval(() => {
      setCurrentTime((prevTime) => {
        const newTime = prevTime + step * speed;
        if (newTime > MAX_TIME) {
          setIsPlaying(false);
          return MAX_TIME;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, initialized, speed, step]);

  // Update current frame based on current time
  useEffect(() => {
    if (!initialized || frameEvents.length === 0) return;

    // Find the frame that corresponds to the current time
    let frameIndex = frameEvents.findIndex((frame) => frame.time > currentTime);
    if (frameIndex === -1) {
      frameIndex = frameEvents.length;
    }
    setCurrentFrame(frameIndex > 0 ? frameIndex - 1 : 0);
  }, [currentTime, frameEvents, initialized]);

  // Process events and update watermark as time progresses
  useEffect(() => {
    if (events.length === 0) return;

    // Filter events that have arrived by the current time
    const arrivedEvents = events.filter((event) => {
      const arrivalTime =
        event.arrivalTime !== undefined ? event.arrivalTime : event.timestamp;
      return arrivalTime <= currentTime;
    });

    if (arrivedEvents.length === 0) return;

    // Calculate watermark based on arrived events
    const maxTimestamp = Math.max(...arrivedEvents.map((e) => e.timestamp));
    // Update the max event time we've seen
    setMaxEventTime(maxTimestamp);
    const newWatermark = Math.max(0, maxTimestamp - lag);
    setWatermarkPosition(newWatermark);

    // Update windows status based on watermark
    setWindows((prevWindows) =>
      prevWindows.map((window) => {
        if (window.end <= newWatermark && window.status !== "closed") {
          // Window is now closed - calculate aggregation
          const windowEvents = arrivedEvents.filter(
            (e) => e.timestamp >= window.start && e.timestamp < window.end,
          );

          const sum = windowEvents.reduce((acc, e) => acc + e.value, 0);
          const avg =
            windowEvents.length > 0
              ? (sum / windowEvents.length).toFixed(1)
              : "0";

          return {
            ...window,
            status: "closed",
            result: {
              count: windowEvents.length,
              sum,
              avg,
              processedAt: currentTime,
            },
          };
        } else if (
          window.start <= newWatermark &&
          window.status === "pending"
        ) {
          return { ...window, status: "active" };
        }
        return window;
      }),
    );

    // Mark events as processed or late
    setEvents((prevEvents) =>
      prevEvents.map((event) => {
        // If event has already been processed, no change
        if (event.processedAt !== null) return event;

        const arrivalTime =
          event.arrivalTime !== undefined ? event.arrivalTime : event.timestamp;

        // If event hasn't arrived yet, no change
        if (arrivalTime > currentTime) return event;

        // Check if this event is late (arrives after its window has closed)
        const isLate = event.windowEnd <= newWatermark;

        // Special case for first event (at 0s)
        if (event.timestamp === 0 && event.type === "in-order") {
          return {
            ...event,
            processedAt: currentTime,
            isLate: false,
          };
        }

        return {
          ...event,
          processedAt: currentTime,
          isLate,
        };
      }),
    );
  }, [currentTime, events, lag]);

  // Time to pixels conversion functions
  const timeToX = (time) => {
    return Math.round((time / MAX_TIME) * INNER_WIDTH);
  };

  // Value to Y position - fixed to have even spacing from 0 to 5
  const valueToY = (value) => {
    return Math.round(INNER_HEIGHT - (value / 5) * INNER_HEIGHT);
  };

  const reset = () => {
    window.location.reload();
  };

  // Update lag and reset visualization when lag changes
  const handleLagChange = (e) => {
    const newLag = parseInt(e.target.value, 10);
    setLag(newLag);
    reset();
  };

  // Frame navigation
  const goToNextFrame = () => {
    if (currentFrame < frameEvents.length - 1) {
      const nextFrame = frameEvents[currentFrame + 1];
      setCurrentTime(nextFrame.time);
      setCurrentFrame(currentFrame + 1);
    }
  };

  const goToPrevFrame = () => {
    if (currentFrame > 0) {
      const prevFrame = frameEvents[currentFrame - 1];
      setCurrentTime(prevFrame.time);
      setCurrentFrame(currentFrame - 1);
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    if (status === "closed") return "Closed";
    if (status === "active") return "Computing";
    return "";
  };

  return (
    <div
      className="w-full max-w-6xl mx-auto p-6 bg-gray-100 rounded-xl"
      style={{ backgroundColor: colors.backgroundDark }}
    >
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2">
          Watermark & Window Processing
        </h3>
        <div
          className="code-block p-4 mb-4 rounded-md text-left mx-auto max-w-3xl overflow-auto"
          style={{ backgroundColor: colors.backgroundDark }}
        >
          <pre className="text-white text-sm">
            <code>
              <span style={{ color: "#569CD6" }}>SELECT</span> window_start,
              <span style={{ color: "#DCDCAA" }}>count</span>(),
              <span style={{ color: "#DCDCAA" }}>sum</span>(v),
              <span style={{ color: "#DCDCAA" }}>avg</span>(v) <br />
              <span style={{ color: "#569CD6" }}>FROM</span>{" "}
              <span style={{ color: "#4EC9B0" }}>tumble</span>(stream,{" "}
              {WINDOW_SIZE / 1000}s) <br />
              <span style={{ color: "#569CD6" }}>
                GROUP BY
              </span> window_start <br />
              <span style={{ color: "#569CD6" }}>
                EMIT AFTER WATERMARK
              </span>{" "}
              <span style={{ color: "#569CD6" }}>WITH DELAY</span> {lag / 1000}s
            </code>
          </pre>
        </div>

        <div className="flex flex-wrap justify-center items-center space-x-4 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-4 py-2 rounded-md font-medium"
            style={{ background: colors.blue, color: "white" }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={goToPrevFrame}
            className="px-4 py-2 rounded-md font-medium"
            style={{ background: colors.purple, color: "white" }}
            disabled={currentFrame <= 0}
          >
            Prev
          </button>

          <button
            onClick={goToNextFrame}
            className="px-4 py-2 rounded-md font-medium"
            style={{ background: colors.purple, color: "white" }}
            disabled={currentFrame >= frameEvents.length - 1}
          >
            Next
          </button>

          <button
            onClick={reset}
            className="px-4 py-2 rounded-md font-medium"
            style={{ background: colors.gray, color: "white" }}
          >
            Reset
          </button>

          <div className="flex items-center mt-2 ml-4">
            <label htmlFor="lag-select" className="mr-2 font-medium">
              DELAY:
            </label>
            <select
              id="lag-select"
              value={lag}
              onChange={handleLagChange}
              className="px-2 py-1 rounded-md"
            >
              <option value={0}>0s</option>
              <option value={1000}>1s</option>
              <option value={2000}>2s</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main visualization */}
      <div className="mx-auto">
        <div
          className="relative"
          style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}
        >
          <svg
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            style={{ overflow: "visible" }}
          >
            {/* Background */}
            <rect
              x={0}
              y={0}
              width={CHART_WIDTH}
              height={CHART_HEIGHT}
              fill={colors.backgroundMedium}
              rx={4}
            />

            {/* Chart area */}
            <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
              {/* Vertical second lines - Updated color for better visibility */}
              {Array.from({ length: MAX_TIME / 1000 + 1 }).map((_, i) => (
                <line
                  key={`second-line-${i}`}
                  x1={timeToX(i * 1000)}
                  y1={0}
                  x2={timeToX(i * 1000)}
                  y2={INNER_HEIGHT}
                  stroke={
                    i % 5 === 0
                      ? "rgba(255,255,255,0.5)"
                      : "rgba(255,255,255,0.3)"
                  }
                  strokeWidth={i % 5 === 0 ? 0.75 : 0.5}
                  strokeDasharray={i % 5 === 0 ? "none" : "2 2"}
                />
              ))}

              {/* Time axis */}
              <line
                x1={0}
                y1={INNER_HEIGHT}
                x2={INNER_WIDTH}
                y2={INNER_HEIGHT}
                stroke="white"
                strokeWidth={1}
              />

              {/* Value axis */}
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={INNER_HEIGHT}
                stroke="white"
                strokeWidth={1}
              />

              {/* Value labels - updated to include 0 and have even spacing */}
              {[0, 1, 2, 3, 4, 5].map((value) => (
                <g key={`value-${value}`}>
                  <line
                    x1={-5}
                    y1={valueToY(value)}
                    x2={0}
                    y2={valueToY(value)}
                    stroke="white"
                  />
                  <text
                    x={-10}
                    y={valueToY(value)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize={12}
                  >
                    {value}
                  </text>
                </g>
              ))}

              {/* Time labels */}
              {Array.from({ length: MAX_TIME / 5000 + 1 }).map((_, i) => (
                <g key={`time-${i}`}>
                  <line
                    x1={timeToX(i * 5000)}
                    y1={INNER_HEIGHT}
                    x2={timeToX(i * 5000)}
                    y2={INNER_HEIGHT + 10}
                    stroke="white"
                  />
                  <text
                    x={timeToX(i * 5000)}
                    y={INNER_HEIGHT + 25}
                    textAnchor="middle"
                    fill="white"
                    fontSize={12}
                  >
                    {i * 5}s
                  </text>
                </g>
              ))}

              {/* Windows */}
              {windows.map((window, i) => {
                // Get exact pixel positions
                const windowStart = timeToX(window.start);
                const windowEnd = timeToX(window.end);
                const windowWidth = windowEnd - windowStart;

                return (
                  <g key={`window-${i}`}>
                    <rect
                      x={windowStart}
                      y={0}
                      width={windowWidth}
                      height={INNER_HEIGHT}
                      fill="transparent"
                      stroke={
                        window.status === "closed"
                          ? colors.green
                          : window.status === "active"
                            ? colors.blue
                            : colors.gray
                      }
                      strokeWidth={1}
                      strokeDasharray={
                        window.status === "pending" ? "4 2" : "none"
                      }
                      opacity={0.8}
                    />

                    {/* Window status below X-axis - new position */}
                    <text
                      x={windowStart + windowWidth / 2}
                      y={INNER_HEIGHT + 45}
                      textAnchor="middle"
                      fill={
                        window.status === "closed"
                          ? colors.green
                          : window.status === "active"
                            ? colors.blue
                            : colors.gray
                      }
                      fontSize={10}
                      fontWeight="bold"
                    >
                      {getStatusText(window.status)}
                    </text>

                    {/* Display aggregation results - adjusted position */}
                    {window.status === "closed" && window.result && (
                      <g>
                        <rect
                          x={windowStart}
                          y={INNER_HEIGHT + 53}
                          width={windowWidth}
                          height={50}
                          fill={colors.backgroundLight}
                          opacity={0.9}
                          rx={4}
                        />
                        <text
                          x={windowStart + windowWidth / 2}
                          y={INNER_HEIGHT + 68}
                          textAnchor="middle"
                          fill="white"
                          fontSize={12}
                          fontWeight="bold"
                        >
                          count(): {window.result.count}
                        </text>
                        <text
                          x={windowStart + windowWidth / 2}
                          y={INNER_HEIGHT + 83}
                          textAnchor="middle"
                          fill="white"
                          fontSize={12}
                          fontWeight="bold"
                        >
                          sum(v): {window.result.sum}
                        </text>
                        <text
                          x={windowStart + windowWidth / 2}
                          y={INNER_HEIGHT + 98}
                          textAnchor="middle"
                          fill="white"
                          fontSize={12}
                          fontWeight="bold"
                        >
                          avg(v): {window.result.avg}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Max event time line - Positioned higher */}
              {maxEventTime > 0 && (
                <g>
                  <line
                    x1={timeToX(maxEventTime)}
                    y1={0}
                    x2={timeToX(maxEventTime)}
                    y2={INNER_HEIGHT}
                    stroke={colors.orange}
                    strokeWidth={1.5}
                    strokeDasharray="4 2"
                  />
                  <text
                    x={timeToX(maxEventTime)}
                    y={-15}
                    textAnchor="middle"
                    fill={colors.orange}
                    fontSize={10}
                    fontWeight="bold"
                  >
                    Max Event Time: {maxEventTime / 1000}s
                  </text>
                </g>
              )}

              {/* Watermark line */}
              <line
                x1={timeToX(watermarkPosition)}
                y1={0}
                x2={timeToX(watermarkPosition)}
                y2={INNER_HEIGHT}
                stroke={colors.pink}
                strokeWidth={2}
              />
              <circle
                cx={timeToX(watermarkPosition)}
                cy={INNER_HEIGHT}
                r={5}
                fill={colors.pink}
              />
              <text
                x={timeToX(watermarkPosition)}
                y={INNER_HEIGHT + 35}
                textAnchor="middle"
                fill={colors.pink}
                fontSize={12}
                fontWeight="bold"
              >
                Watermark: {watermarkPosition / 1000}s
              </text>

              {/* Events */}
              {events
                .filter((event) => {
                  const arrivalTime =
                    event.arrivalTime !== undefined
                      ? event.arrivalTime
                      : event.timestamp;
                  return arrivalTime <= currentTime;
                })
                .map((event) => {
                  // Determine event color based on its type AND current isLate status
                  let eventColor;

                  if (event.timestamp === 0 && event.type === "in-order") {
                    // Special case for first event
                    eventColor = colors.cyan;
                  } else if (event.isLate) {
                    // Late events (missed their window)
                    eventColor = colors.red;
                  } else if (
                    event.type === "out-of-order" ||
                    event.type === "late"
                  ) {
                    // Out-of-order events that aren't late yet
                    eventColor = colors.yellow;
                  } else {
                    // Normal in-order events
                    eventColor = colors.cyan;
                  }

                  const circleRadius = 12; // Fixed size for all events

                  // Calculate actual arrival-timestamp difference for true delay
                  const actualDelay =
                    event.arrivalTime !== undefined
                      ? event.arrivalTime - event.timestamp
                      : 0;

                  // Only show delay for events that have an actual delay
                  const showDelay = actualDelay > 0;

                  return (
                    <g key={`event-${event.id}`}>
                      {/* Event marker */}
                      <circle
                        cx={timeToX(event.timestamp)}
                        cy={valueToY(event.value)}
                        r={circleRadius}
                        fill={eventColor}
                        opacity={event.processedAt ? 1 : 0.5}
                      />

                      {/* Sequence number inside circle */}
                      <text
                        x={timeToX(event.timestamp)}
                        y={valueToY(event.value)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize={10}
                        fontWeight="bold"
                      >
                        {event.sequenceNumber}
                      </text>

                      {/* Delay label for events with actual delay */}
                      {showDelay && (
                        <text
                          x={timeToX(event.timestamp)}
                          y={valueToY(event.value) + circleRadius + 10}
                          textAnchor="middle"
                          fill={eventColor}
                          fontSize={9}
                          fontWeight="bold"
                        >
                          ({actualDelay / 1000}s delay)
                        </text>
                      )}

                      {/* Horizontal line showing the delay - only for events with actual delay */}
                      {showDelay && (
                        <g>
                          {/* Horizontal line to show the time gap */}
                          <line
                            x1={timeToX(event.timestamp)}
                            y1={valueToY(event.value) + circleRadius + 20}
                            x2={timeToX(event.arrivalTime)}
                            y2={valueToY(event.value) + circleRadius + 20}
                            stroke={eventColor}
                            strokeWidth={1.5}
                            strokeDasharray="2 1"
                          />

                          {/* Ticks on timeline */}
                          <line
                            x1={timeToX(event.timestamp)}
                            y1={valueToY(event.value) + circleRadius + 17}
                            x2={timeToX(event.timestamp)}
                            y2={valueToY(event.value) + circleRadius + 23}
                            stroke={eventColor}
                            strokeWidth={1}
                          />
                          <line
                            x1={timeToX(event.arrivalTime)}
                            y1={valueToY(event.value) + circleRadius + 17}
                            x2={timeToX(event.arrivalTime)}
                            y2={valueToY(event.value) + circleRadius + 23}
                            stroke={eventColor}
                            strokeWidth={1}
                          />
                        </g>
                      )}
                    </g>
                  );
                })}
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div
          className="mt-24 flex flex-wrap justify-center gap-4"
          style={{ marginTop: "8px" }}
        >
          <div className="flex items-center">
            N: sequence number when the event was received &nbsp;
            <div
              className="w-8 h-8 mr-2 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.cyan }}
            >
              <span className="text-white text-xs font-bold">&nbsp;</span>
            </div>
            <span>Normal Event</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-8 h-8 mr-2 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.yellow }}
            >
              <span className="text-white text-xs font-bold">&nbsp;</span>
            </div>
            <span>Out-of-Order Event</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-8 h-8 mr-2 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.red }}
            >
              <span className="text-white text-xs font-bold">&nbsp;</span>
            </div>
            <span>Late Event</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeplusWatermarkVisualization;
