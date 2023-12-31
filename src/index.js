import "./styles.css";
import { Chart } from "frappe-charts/dist/frappe-charts.min.esm";

// this is for preventing the site on reloading
var form = document.getElementById("myForm");
function handleForm(event) {
  event.preventDefault();
}
form.addEventListener("submit", handleForm);

const btnSubmit = document.getElementById("submit-data");

const jsonQuery = {
  query: [
    {
      code: "Vuosi",
      selection: {
        filter: "item",
        values: [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021",
        ],
      },
    },
    {
      code: "Alue",
      selection: {
        filter: "item",
        values: ["SSS"],
      },
    },
    {
      code: "Tiedot",
      selection: {
        filter: "item",
        values: ["vaesto"],
      },
    },
  ],
  response: {
    format: "json-stat2",
  },
};

const getData = async () => {
  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(jsonQuery),
  });

  const data = await res.json();
  return data;
};

function calcNewValue(arrayOfValues) {
  let sum = 0;
  for (let i = 0; i < arrayOfValues.length - 1; i++) {
    sum = sum + (arrayOfValues[i + 1] - arrayOfValues[i]);
  }
  sum = sum / (arrayOfValues.length - 1);
  sum = sum + arrayOfValues[arrayOfValues.length - 1];
  sum = Math.round(sum);
  return sum;
}

let predictValueButton = null;

async function buildChart() {
  const data = await getData();

  const years = Object.values(data.dimension.Vuosi.category.label);
  const values = data.value;

  const chartData = {
    labels: years,
    datasets: [
      {
        name: "Population",
        values: values,
      },
    ],
  };

  new Chart("#chart", {
    title: "Population growth",
    data: chartData,
    type: "line",
    height: 450,
    colors: ["#eb5146"],
  });

  if (predictValueButton == null) {
    console.log("Sitä ei oo vielä");
    predictValueButton = document.createElement("button");
    predictValueButton.setAttribute("id", "add-data");
    predictValueButton.innerText = "Add predicted value";
    let htmlBody = document.getElementById("htmlbody");
    htmlBody.appendChild(predictValueButton);
  }

  (await predictValueButton).addEventListener("click", () => {
    let newValue = calcNewValue(values);

    // predicted values:
    let newYearValue = (parseInt(years[years.length - 1]) + 1).toString();
    years.push(newYearValue);
    values.push(newValue);

    const chartData = {
      labels: years,
      datasets: [
        {
          name: "Population",
          values: values,
        },
      ],
    };

    new Chart("#chart", {
      title: "Population growth",
      data: chartData,
      type: "line",
      height: 450,
      colors: ["#eb5146"],
    });
  });
}

function searchString(str, arrayStr) {
  if (str.length == 0) {
    return -1;
  }
  for (let i = 0; i < arrayStr.length; i++) {
    if (arrayStr[i].toUpperCase().match(str.toUpperCase())) {
      return i;
    }
  }
  return -1;
}

btnSubmit.addEventListener("click", async () => {
  const muni = document.getElementById("input-area").value;

  const url =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";
  const res = await fetch(url);
  const data = await res.json();
  const names = data.variables[1].valueTexts;
  const codes = data.variables[1].values;

  const index = searchString(muni, names);

  jsonQuery.query[1].selection.values[0] = codes[index];
  buildChart();
});
