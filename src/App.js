import './App.css';
import { useState } from 'react';

function App() {
  const [file, setFile] = useState();
  const [data, setData] = useState([]);
  const [longestPair, setLongestPair] = useState([]);

  const fileReader = new FileReader();

  const convertDates = (dateString) => {
    const regexPattern = /((?=\d{4})\d{4}|(?=[a-zA-Z]{3})[a-zA-Z]{3}|\d{1,2})((?=\/)\/|\-|\.|\,)((?=[0-9]{2})[0-9]{2}|(?=[0-9]{1,2})[0-9]{1,2}|[a-zA-Z]{3})((?=\/)\/|\-|\.|\,)((?=[0-9]{4})[0-9]{4}|(?=[0-9]{2})[0-9]{2}|[a-zA-Z]{3})/g;
  
    return dateString.replace(regexPattern, (match) => {
      const dateParts = match.split(/(\/|\-|\.|\,)/);
      const yearIndex = dateParts.findIndex(part => part.match(/\d{4}/));
      let dayIndex;
      yearIndex > 0 ? dayIndex = 4 : dayIndex = 0;
      const year = dateParts[yearIndex].length === 4 ? dateParts[yearIndex] : new Date().getFullYear().toString().substring(0, 2) + dateParts[yearIndex];
      const month = dateParts[2].length === 1 ? '0' + dateParts[2] : dateParts[2];
      const day = dateParts[dayIndex].length === 1 ? '0' + dateParts[dayIndex] : dateParts[dayIndex];
  
      return `${year}/${month}/${day}`;
    });
  };
  
  
  const handleOnChange = (e) => {
    setFile(e.target.files[0]);
  };
  function longestWorkingPair(){
    let projects = {};

    data.forEach(([employeeId, projectId, dataFrom, dataTo]) => {
      if(projectId){
        const startDate = new Date(dataFrom);
        const endDate = new Date(dataTo);
        const duration = Math.ceil((Math.abs(endDate - startDate)) / (1000 * 60 * 60 * 24));
        if(!projects[projectId]) {
          projects[projectId] = {
            duration: 0,
            employees: []
          };
        }

        projects[projectId].duration += duration;
        projects[projectId].employees.push(employeeId);
      }
    })
    let longestDuration = 0;
    let result = [];
    Object.entries(projects).forEach(([projectId, project]) => {
      if(project.duration > longestDuration) {
        longestDuration = project.duration;
        result = [...project.employees, projectId, longestDuration];
      }
    })
    setLongestPair(result.join(', '))
  }
  
  const csvFileConvertToArray = (fileImp) => {
    const csvRows = fileImp.split('\n').map(x => x.trim()).filter(str => str !== '');
    const tRows = csvRows.map(x => x.split(';').filter(cell => cell !== ''));

    for (let i = 0; i < tRows.length; i++) {
      for (let j = 0; j < tRows[i].length; j++) {
        const element = tRows[i][j];
        if (j < 2) {
          tRows[i][j] = Number(element);
        } else if (j <= 3 && element.toLowerCase() !== 'null') {
          const formatDate = convertDates(element);
          const [year, month, day] = formatDate.split('/');
          tRows[i][j] = new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString();
        } else if (j === 3 && element.toLowerCase() === 'null') {
          tRows[i][j] = new Date().toLocaleDateString();
        }
      }
    }
    setData(tRows);
  };


  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event) {
        const csvOutput = event.target.result;
        csvFileConvertToArray(csvOutput);
      };

      fileReader.readAsText(file);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>.CSV IMPORT</h1>
      <form>
        <input
          type="file"
          id="csvFileInput"
          accept=".csv"
          onChange={handleOnChange}
        />

        <button
          onClick={(e) => {
            handleOnSubmit(e);
          }}
        >
          IMPORT CSV
        </button>
      </form>

      <table style={{ width: "100%", marginTop: "50px", border: '1px solid black' }}>
        <thead>
          <tr>
            <th>EmployeeId</th>
            <th>ProjectId</th>
            <th>DateFrom</th>
            <th>DateTo</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={longestWorkingPair} >Click me</button>

      <p>Longest working pair: {longestPair}</p>
    </div>
  );
}

export default App;
