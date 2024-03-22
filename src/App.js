import { useState, useEffect, useRef, createRef } from "react";
import Papa from 'papaparse';
import './App.css'
import Quote from './Quote';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import VirtualizedSelect from 'react-virtualized-select'
import {
  CellMeasurer,
  CellMeasurerCache,
  createMasonryCellPositioner,
  Masonry
} from "react-virtualized";
import 'react-virtualized-select/styles.css'; // Import the styles
import './react-select.css'
import 'react-virtualized/styles.css'


function App() {
  //const [ data, setText ] = useState([]);
  const [ allquotes, setAllquotes ] = useState([]);
  const [ quotes, setQuotes ] = useState([]);
  const [ quoteArray, setQuoteArray ] = useState([]);

  const [topicOptions, setTopicOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [topicFilter, setTopicFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  const masonryRef = useRef();
  const dataLoaded = useRef(false);
  const virtualizedSelectRef = useRef();

  const topicRef = useRef();
  const roleRef = useRef();


    useEffect(() => {
      if (dataLoaded.current == false) {
        fetch( './goodreadsquotes.csv' )
          .then( response => response.text() )
          .then( responseText => {
            var data = Papa.parse(responseText);
            processCSV(data.data);
          })
        dataLoaded.current = true;
      } 
    }, []);


    function processCSV(data) {
      let tempQuotes = [];
      let topics = new Set();
      let roles = new Set();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0].trim().length > 0) {
          tempQuotes.push(data[i]);
          if (data[i][1].trim().length > 0) {
            if (!roles.has(data[i][1].trim())) {
              roles.add(data[i][1].trim())
            }
          } 
          let elements = data[i][2].slice(1, -1).split(', ').map(element => element.replace(/'/g, ''));
          for (let j = 0; j < elements.length; j++) {
            let tag = elements[j].split(1,elements[j].length-1)
            if (!topics.has(tag)) {
              topics.add(tag);
            }
          }
          
        }
      }
      setQuotes(tempQuotes);
      setAllquotes(tempQuotes);
      setTopicOptions(Array.from(topics));
      setRoleOptions(Array.from(roles));

      const items = new Array(tempQuotes.length).fill().map((item, i) => {
          return <Quote key={i} row={tempQuotes[i]}/>
      });
      setQuoteArray(items);
    }


    function recomputeQuotes(topicTemp, roleTemp) {
      topicRef.current = topicTemp;
      roleRef.current = roleTemp;

      const filteredQuotes = allquotes.filter((quote) => {
        let included = true;
        let quoteTags = quote[2].slice(1, -1).split(', ').map(element => element.replace(/'/g, ''));
        if (topicRef.current !== undefined) {
          for (let k = 0; k < topicRef.current.length; k++) {
            if (!quoteTags.includes(topicRef.current[k].value[0])) {
              included = false;
            }
          }
        }
        return (
          (topicRef.current === undefined || topicRef.current === null || (topicRef.current && topicRef.current.length == 0) || included) &&
          quote[0] && quote[0].length > 0 &&
          (roleRef.current === undefined || roleRef.current === null || (roleRef.current && roleRef.current.length == 0) || (roleRef.current && quote[1].trim() === roleRef.current.value))
        );
      });

      const items = new Array(filteredQuotes.length).fill().map((item, i) => {
          return <Quote row={filteredQuotes[i]}/>
      });
      
      cache.clearAll();
      masonryRef.current.clearCellPositions();
      setQuoteArray(items);
      setTopicFilter(topicTemp);
      setRoleFilter(roleTemp);

      cellPositioner.reset({
        columnCount: 4,
        columnWidth: 250,
        spacer: 15,
      });
      masonryRef.current.recomputeCellPositions();
      
      
    }

    const cache = new CellMeasurerCache({
      defaultWidth: (window.innerWidth*0.195),
      fixedWidth: true,
    });

    const cellPositioner = createMasonryCellPositioner({
      cellMeasurerCache: cache,
      columnCount: 5,
      columnWidth: (window.innerWidth*0.195),
      spacer: 10,
    });


    function cellRenderer({index, key, parent, style}) {

      const datum = quoteArray[index];

      const hiddenElement = document.createElement('div');
      hiddenElement.textContent = datum ? datum.props.row[0] : "";
      hiddenElement.style.visibility = 'hidden';
      hiddenElement.style.width = `${window.innerWidth*0.195-16}px`;
      hiddenElement.style.position = 'absolute';
      hiddenElement.className = 'masonry-item';
      document.body.appendChild(hiddenElement);
      let textHeight = hiddenElement.offsetHeight;
      document.body.removeChild(hiddenElement);
      
      const uniqueKey = `cell-${index}`;

      return (
        <CellMeasurer cache={cache} index={index} key={uniqueKey} parent={parent}>
          <div style={style}>
            <div style={{height: `${textHeight}px`, overflow: 'hidden'}}>
            {datum}
            </div>
          </div>
        </CellMeasurer>
      );      
    }


    return (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '97%', margin: '16px' }}>
        <Typography variant="h4" style={{ marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>Inspirational Quote Board</Typography>
        <div style={{ marginBottom: '20px', display: 'flex' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
            <Typography variant="subtitle1" style={{ marginRight: '8px', fontSize: '20px' }}>Tag:</Typography>
            <VirtualizedSelect
              options={topicOptions.map(element => {
                return { value: element, label: element.map(tag => tag.replace('-', ' ')) };
              })}
              onChange={(e) => 
                //setTopicFilter(e)
                recomputeQuotes(e, roleRef.current)
              }
              value={topicFilter}
              sx={{fontSize:'20px', width: '300px'}}
              multi={true}
              ref={virtualizedSelectRef}
              isMulti
            >
              {topicOptions.map((option) => (
              <MenuItem key={option} value={option} style={{ fontSize: '20px' }}>
                {option}
              </MenuItem>
            ))}
            </VirtualizedSelect>
          </div>


          <div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
            <Typography variant="subtitle1" style={{ marginRight: '8px', fontSize: '20px' }}>Author:</Typography>
            <VirtualizedSelect
              options={roleOptions.map(element => {
                return { value: element, label: element.replace(",", "") };
              })}
              onChange={(e) => 
                recomputeQuotes(topicRef.current, e)
              }
              value={roleFilter}
              sx={{fontSize:'20px'}}
            >
              {roleOptions.map((option) => (
              <MenuItem key={option} value={option} style={{ fontSize: '20px' }}>
                {option}
              </MenuItem>
            ))}
            </VirtualizedSelect>
          </div>
        </div>
        </div>
        <div className="masonry-container">
          <Masonry
            cellCount={quoteArray.length}
            cellMeasurerCache={cache}
            cellPositioner={cellPositioner}
            cellRenderer={cellRenderer}
            keyMapper={(index) => index}
            height={window.innerHeight-115}
            width={window.innerWidth}
            ref={masonryRef}
          />
         </div>

      </>
      
            
    );
}

export default App;
