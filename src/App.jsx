import './App.scss';
import { useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import moment from 'moment';

const axios = require('axios').default;

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [activities, setActivities] = useState([]);

  async function getActivities() {
    try {
      const response = await axios.get('http://localhost:3001/activities');
      setActivities(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function postData(data) {
    try {
      let startTime = moment(data.start_time, 'HH:mm');
      const finishTime = moment(data.finish_time, 'HH:mm');
      if (finishTime.isBefore(startTime)) startTime = startTime.subtract(1, 'day');
      await axios.post('http://localhost:3001/activities', {
        ...data,
        start_time: startTime.format('X'),
        finish_time: finishTime.format('X'),
      });
      await getActivities();
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    getActivities().finally();
  }, []);

  const { longestRide, longestRun, totalRides, totalRuns } = useMemo(() => {
    let ride = { distance: 0 };
    let run = { distance: 0 };
    let totalRides = 0;
    let totalRuns = 0;
    activities.forEach((item) => {
      if (item.type === 'Ride') {
        if (item.distance > ride.distance) ride = item;
        totalRides = totalRides + item.distance;
      }
      if (item.type === 'Run') {
        if (item.distance > run.distance) run = item;
        totalRuns = totalRuns + item.distance;
      }
    });
    return { longestRide: ride, longestRun: run, totalRides, totalRuns };
  }, [activities.length]);

  const getDuration = (item) => {
    const startTime = moment(item.start_time, 'X');
    const finishTime = moment(item.finish_time, 'X');
    const duration = moment.duration(Math.abs(startTime.format('X') - finishTime.format('X')) * 1000);
    const durationText = `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;
    return { duration, durationText };
  };

  return (
    <>
      <header className="header wrapper">
        <img src="/run.gif" alt="run" className="header__gif" />
        <div className="header__titlebox">
          <div className="header__titlebox__dots">
            <div className="header__titlebox__dots__dot" />
            <div className="header__titlebox__dots__dot" />
            <div className="header__titlebox__dots__dot" />
          </div>
          <p className="header__titlebox__title">Wise Activity Tracker</p>
        </div>
      </header>
      <form onSubmit={handleSubmit(postData)} className="toolbar wrapper container">
        <p className="toolbar__title">Add new activity:</p>
        <div className="toolbar__fields">
          <div className="toolbar__fields__wrapper">
            <p className="toolbar__fields__wrapper__title">Start time</p>
            <input
              required={true}
              {...register('start_time')}
              type="time"
              className="toolbar__fields__wrapper__start"
              placeholder="Start time"
            />
          </div>

          <div className="toolbar__fields__wrapper">
            <p className="toolbar__fields__wrapper__title">Finish time</p>
            <input
              required={true}
              {...register('finish_time')}
              type="time"
              className="toolbar__fields__wrapper__finish"
              placeholder="Finish time"
            />
          </div>
          <div className="toolbar__fields__wrapper">
            <p className="toolbar__fields__wrapper__title">Distance (km)</p>
            <input
              required={true}
              {...register('distance')}
              type="number"
              className="toolbar__fields__wrapper__distance"
              placeholder={0}
            />
          </div>
        </div>
        <select required={true} {...register('type')} name="type" className="toolbar__type">
          <option value="">Select activity type</option>
          <option value="Ride">Riding</option>
          <option value="Run">Running</option>
        </select>
        <input type="submit" value="Save" className="toolbar__save" />
      </form>
      <main className="main wrapper">
        {activities ? (
          <div className="main__history container">
            {[...activities]
              .sort((a1, a2) => a1.date - a2.date)
              .reverse()
              .map((item, index) => {
                const date = moment(item.date, 'X');
                const { duration, durationText } = getDuration(item);
                const speed = item.distance / duration.asHours();
                const icon = item.type === 'Ride' ? '/running.svg' : '/bicycle.svg';
                return (
                  <div className="main__history__activity" key={index}>
                    <p className="main__history__activity__type">
                      <img className="main__history__activity__type__icon" src={icon} alt="icon" />
                    </p>
                    <p className="main__history__activity__date">{date.calendar()}</p>
                    <p className="main__history__activity__distance">{item.distance} km</p>
                    <p className="main__history__activity__time">{durationText}</p>
                    <p className="main__history__activity__speed">{speed.toFixed(1)} km/h</p>
                  </div>
                );
              })}
          </div>
        ) : (
          ''
        )}
        <div className="main__sidebar">
          <div className="main__sidebar__longest ">
            <div className="main__sidebar__longest__ride">
              <p className="main__sidebar__longest__ride__title">Longest ride</p>
              <div className="main__sidebar__longest__ride__info">
                <p className="main__sidebar__longest__ride__info__date">
                  {moment(longestRide.date, 'X').format('MMM DD')}
                </p>
                <p className="main__sidebar__longest__ride__info__distance">{longestRide.distance} km</p>
                <p className="main__sidebar__longest__ride__info__time">{getDuration(longestRide).durationText}</p>
              </div>
            </div>
            <div className="main__sidebar__longest__run">
              <p className="main__sidebar__longest__run__title">Longest run</p>
              <div className="main__sidebar__longest__run__info">
                <p className="main__sidebar__longest__run__info__date">
                  {moment(longestRun.date, 'X').format('MMM DD')}
                </p>
                <p className="main__sidebar__longest__run__info__distance">{longestRun.distance} km</p>
                <p className="main__sidebar__longest__run__info__time">{getDuration(longestRun).durationText}</p>
              </div>
            </div>
          </div>
          <div className="main__sidebar__total">
            <div className="main__sidebar__total__ride">
              <p className="main__sidebar__total__ride__title">Total ride distance:</p>
              <p className="main__sidebar__total__ride__distance">{totalRides} km</p>
            </div>
            <div className="main__sidebar__total__run">
              <p className="main__sidebar__total__run__title">Total run distance:</p>
              <p className="main__sidebar__total__run__distance">{totalRuns} km</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
