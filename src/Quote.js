import {useState} from 'react';

const Quote = ({row}) => {
    const [flipped, setFlipped] = useState(false)
    let canShow = row && row.length > 0;
    let quoteLonger = true;
    if (canShow) {
        if (row[0].length < row[1].length) {
            quoteLonger = false;
        }
    }

    let memoExists = canShow && row[0] && row[0].trim().length > 0;

    return (
        <div onClick={() => setFlipped(!flipped)}>
            
            <div className={`masonry-item ${memoExists ? 'hover-panel' : ''}`}>
                {canShow &&
                    <>
                    <span className={`${quoteLonger ? 'span-longer' : 'span-shorter'} ${flipped ? 'invisible' : 'visible'}`}>{row[0]}</span>
                    <span className={`${quoteLonger ? 'span-shorter' : 'span-longer'} ${flipped ? 'visible' : 'invisible'}`}>{row[1].replace(",", "")}</span>
                    </>
                }
            </div>
        </div>
    )
}

export default Quote;