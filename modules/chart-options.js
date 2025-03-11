export var defaultSeriesLine = {
  data: [],
  emphasis: {
    disabled: true,
  },
  label: {
    backgroundColor: "inherit",
    borderColor: "inherit",
    borderRadius: 3,
    color: "#333",
    fontSize: 20,
    padding: 4,
    position: "right",
    show: true,

    fontWeight: "bold",
    borderColor: "#333",
    borderWidth: 1,
  },
  lineStyle: {
    width: 1,
  },
  showSymbol: false,
  silent: true,
  symbol: "circle",
  symbolSize: 7,
  type: "line",
  xAxisIndex: 0,
  yAxisIndex: 0,
};

export var defaultXAxis = {
  animation: true,
  axisLine: {
    lineStyle: {
      color: "transparent",
    },
  },
  nameLocation: "middle",
  nameTextStyle: { color: "#555", padding: 10 },
  position: "bottom",
  scale: true,
  show: true,
  silent: true,
  type: "value",
};

export var defaultYAxis = {
  animation: false,
  axisLine: {
    lineStyle: {
      color: "transparent",
    },
  },
  name: "",
  nameLocation: "middle",
  nameRotate: 90,
  nameTextStyle: { color: "#555", padding: 35 },
  position: "left",
  scale: true,
  show: true,
  silent: true,
  type: "value",
};

export var defaultGrid = {
  backgroundColor: "transparent",
  borderColor: "transparent",
  left: 70,
  top: 30,
  right: 50,
  bottom: 90,
  show: true,
};

export var defaultDataZoom = [
  {
    type: "slider",
    xAxisIndex: [0, 1, 2, 3, 4, 5, 6, 7],
    filterMode: "none",
    handleSize: 30,
    orient: "horizontal",
    brushStyle: {
      color: "#2c3028",
    },
    handleStyle: {
      color: "#2c3028",
      borderColor: "#3d667b",
    },
    fillerColor: "#202326",
    moveHandleStyle: {
      color: "#2C4040",
    },
    backgroundColor: "#232629",
    borderColor: "#2B2E31",
    dataBackground: {
      areaStyle: { color: "transparent" },
      lineStyle: { color: "transparent" },
    },
    height: 20,
    emphasis: {
      handleStyle: {
        borderColor: "#5187A2",
        color: "#4D6161",
      },
      moveHandleStyle: {
        color: "#344c4c",
      },
    },
  },
  {
    type: "inside",
    xAxisIndex: [0, 1, 2, 3, 4, 5, 6, 7],
    filterMode: "none",
    handleSize: 40,
    orient: "horizontal",
  },
];

export var chartInitialOptions = {
  animation: true,
  axisPointer: {
    link: [
      {
        xAxisIndex: "all",
      },
    ],
  },
  backgroundColor: "hsl(210 10% 11%)",
  dataZoom: [],
  grid: [],
  queries: [],
  series: [],
  dateRanges: "",
  tooltip: {
    axisPointer: {
      animation: false,
      lineStyle: {
        color: "#aa2222",
        width: 1,
        type: "dashed",
      },
      link: [
        {
          xAxisIndex: "all",
        },
      ],
      type: "line",
    },
    backgroundColor: "#14181cbb",
    borderColor: "#242628",
    position: ["0", "0"],
    show: true,
    textStyle: {
      color: "#ddd",
      fontSize: 18,
      textBorderType: "dashed",
    },
    trigger: "axis",
  },
  xAxis: [],
  yAxis: [],
};
