import { useEffect, useState, useMemo } from 'react'
import './app.css'
import TextField from '@mui/material/TextField'
import DatePicker from '@mui/lab/DatePicker';
import * as fns from 'date-fns';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { CSVLink } from "react-csv";

type TPayEntry = {
  date: Date,
  staffPayDay: Date | null,
  bonusPayDay: Date | null,
}

enum Days {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 0
}

export const getBaseSalaryPayDay = (givenDate: Date) => {
  let result = null;
  let offset = 0
  const endOfMonth = fns.endOfMonth(givenDate);

  do result = fns.add(endOfMonth, { days: -1 * offset++ });
  while ([Days.Saturday, Days.Sunday].includes(result.getDay()));

  return result;
}

export const getBonusPayDay = (givenDate: Date) => {
  let offset = 14;
  const nextMonth = fns.add(givenDate, { months: 1, days: offset });

  if (![Days.Saturday, Days.Sunday].includes(nextMonth.getDay())) return nextMonth;

  let result = null;
  do result = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), offset++);
  while (result.getDay() !== Days.Wednesday)

  return result;
}

const monthsOfSchedule = 12;

function App() {
  const [startDate, setStartDate] = useState<Date>(fns.startOfMonth(new Date()));
  const [payroll, setPayroll] = useState<TPayEntry[]>();

  const generatePayroll = useMemo(() => {
    const entries: TPayEntry[] = [];
    for (let i = 0; i < monthsOfSchedule; i++) {
      const month = entries.length ? fns.add(startDate, { months: i }) : startDate;
      entries.push({ date: month, staffPayDay: getBaseSalaryPayDay(month), bonusPayDay: getBonusPayDay(month) });
    }
    return entries;
  }, [startDate])

  useEffect(() => {
    if (startDate) setPayroll(generatePayroll);
  }, [startDate])

  const renderScheduleRows = useMemo(() => {
    if (!payroll) return null;
    return payroll.map(entry => (
      <TableRow key={entry.date.toString()}>
        <TableCell>{fns.format(entry.date, 'MMMM YYY')}</TableCell>
        <TableCell>{fns.format(entry.staffPayDay as Date, 'dd E MMMM YYY')}</TableCell>
        <TableCell>{fns.format(entry.bonusPayDay as Date, 'dd E MMMM YYY')}</TableCell>
      </TableRow>
    ))
  }, [payroll])

  return (
    <div className="app">
      <DatePicker
        views={['year', 'month']}
        label="Start date (year and month)"
        value={startDate}
        onChange={(newValue) => {
          setStartDate(newValue as Date);
        }}
        renderInput={(params) => <TextField {...params} helperText={null} />}
      />
      {!!startDate && (
        <div>
          <h1>Payroll schedule</h1>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Staff pay date</TableCell>
                  <TableCell>Bonus pay date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {renderScheduleRows}
              </TableBody>
            </Table>
          </TableContainer>
          {!!payroll && <CSVLink data={payroll}>Download as CSV</CSVLink>}
        </div>
      )}
    </div>
  )
}

export default App
