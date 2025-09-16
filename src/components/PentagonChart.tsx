import React from "react";

// TypeScript interfaces
interface DataPoint {
    label: string;
    value: number;
}

interface PentagonChartProps {
    data: DataPoint[];
    size?: number;
    className?: string;
}

/**
 * PentagonChart component - displays a spider/pentagon chart with 5 metrics
 * @param props - Component props
 * @param props.data - Array of 5 objects with {label, value} (values are relative to each other)
 * @param props.size - Size of the chart (default: 280)
 * @param props.className - Additional CSS classes
 */
const PentagonChart: React.FC<PentagonChartProps> = ({
    data = [],
    size = 280,
    className
}) => {
    console.log("PentagonChart - Received data:", data);

    if (data.length !== 5) {
        console.warn("PentagonChart requires exactly 5 data points, received:", data.length, data);
        return null;
    }

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35; // Adjust radius based on size

    // Calculate points for pentagon
    const getPentagonPoints = () => {
        const points: { x: number; y: number }[] = [];
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2; // Start from top
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            points.push({ x, y });
        }
        return points;
    };

    // Calculate data points based on values (relative to max value in dataset)
    const getDataPoints = () => {
        const pentagonPoints = getPentagonPoints();
        const maxValue = Math.max(...data.map(item => item.value));

        return data.map((item, index) => {
            const normalizedValue = item.value / maxValue; // Relative to highest value
            const point = pentagonPoints[index];
            const x = centerX + (point.x - centerX) * normalizedValue;
            const y = centerY + (point.y - centerY) * normalizedValue;
            return { x, y, label: item.label, value: item.value };
        });
    };

    const pentagonPoints = getPentagonPoints();
    const dataPoints = getDataPoints();

    // Create SVG path for pentagon outline
    const pentagonPath = pentagonPoints
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
        .join(" ") + " Z";

    // Create SVG path for data area
    const dataPath = dataPoints
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
        .join(" ") + " Z";

    // Create grid lines (concentric circles)
    const gridLines: string[] = [];
    for (let i = 1; i <= 5; i++) {
        const gridRadius = (radius * i) / 5;
        const gridPoints = pentagonPoints.map(point => {
            const x = centerX + (point.x - centerX) * (i / 5);
            const y = centerY + (point.y - centerY) * (i / 5);
            return { x, y };
        });
        const gridPath = gridPoints
            .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
            .join(" ") + " Z";
        gridLines.push(gridPath);
    }

    return (
        <div className={`flex items-center justify-center w-full ${className || ""}`}>
            <div className="relative">
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="drop-shadow-lg w-full h-auto max-w-full min-w-[200px] max-w-[350px] md:min-w-[150px] md:max-w-[250px] sm:min-w-[120px] sm:max-w-[200px]"
                >
                    {/* Grid lines */}
                    {gridLines.map((path, index) => (
                        <path
                            key={index}
                            d={path}
                            fill="none"
                            stroke="rgba(168, 96, 250, 0.2)"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Pentagon outline */}
                    <path
                        d={pentagonPath}
                        fill="none"
                        stroke="rgba(192, 58, 240, 0.4)"
                        strokeWidth="2"
                    />

                    {/* Data area */}
                    <path
                        d={dataPath}
                        fill="rgba(224, 141, 255, 0.2)"
                        stroke="rgba(211, 105, 249, 0.4)"
                        strokeWidth="2"
                    />

                    {/* Data points */}
                    {dataPoints.map((point, index) => (
                        <circle
                            key={index}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill="rgba(192, 58, 240, 1)"
                            stroke="white"
                            strokeWidth="2"
                        />
                    ))}
                </svg>

                {/* React Component Labels */}
                {pentagonPoints.map((point, index) => {
                    const label = data[index]?.label || "";

                    // Adjust label distance based on position (top labels closer)
                    let labelDistance = 1.3;
                    if (index === 0) { // Top label
                        labelDistance = 1.25;
                    } else if (index === 1 || index === 4) { // Side labels
                        labelDistance = 1.70;
                    }

                    const labelX = centerX + (point.x - centerX) * labelDistance;
                    const labelY = centerY + (point.y - centerY) * labelDistance;

                    // Split long labels into multiple lines
                    const words = label.split(' ');
                    const lines: string[] = [];
                    let currentLine = '';

                    words.forEach(word => {
                        if ((currentLine + ' ' + word).length <= 8) {
                            currentLine = currentLine ? currentLine + ' ' + word : word;
                        } else {
                            if (currentLine) lines.push(currentLine);
                            currentLine = word;
                        }
                    });
                    if (currentLine) lines.push(currentLine);

                    return (
                        <div
                            key={index}
                            className="absolute pointer-events-none"
                            style={{
                                left: `${(labelX / size) * 100}%`,
                                top: `${(labelY / size) * 100}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            <div className="text-center relative">
                                {lines.map((line, lineIndex) => (
                                    <div
                                        key={lineIndex}
                                        className="text-xs font-medium  whitespace-nowrap "
                                        style={{
                                            border: "1px solid  rgba(80, 69, 90, 0.6)",
                                            borderRadius: "10px",
                                            padding: "2px 4px",
                                            paddingRight: "30px",
                                            position: "relative",

                                            fontSize: '12px',
                                            //   fontWeight: '500',
                                            color: " rgb(195, 186, 204)",
                                            //   textShadow: '0 0 4px rgba(149, 70, 223, 0.6)',
                                            lineHeight: '12px',
                                            marginTop: lineIndex > 0 ? '0px' : '0px'
                                        }}
                                    >
                                        {line}
                                    </div>
                                ))}
                                 {/* Label Value - positioned at top right corner */}
                                 <div
                                     className="absolute top-[-2px] right-0 bg-[#FCD845]  text-xs font-bold rounded-full flex items-center justify-center"
                                     style={{
                                         width: '22px',
                                         height: '22px',
                                         fontSize: '12px',
                                         minWidth: '16px',
                                         color: "black"
                                     }}
                                 >
                                     {data[index]?.value || 0}
                                 </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PentagonChart;
