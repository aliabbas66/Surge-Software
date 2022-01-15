import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo } from 'react';

function Widget2(props) {

    const nFormatter = (num, digits) => {
        const lookup = [
            { value: 1, symbol: "" },
            { value: 1e3, symbol: "k" },
            { value: 1e6, symbol: "M" },
            { value: 1e9, symbol: "G" },
            { value: 1e12, symbol: "T" },
            { value: 1e15, symbol: "P" },
            { value: 1e18, symbol: "E" }
        ];
        const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        const nmbr = lookup.slice().reverse().find((item) => {
            return num >= item.value;
        });
        return nmbr ? (num / nmbr.value).toFixed(digits).replace(rx, "$1") + nmbr.symbol : "0";
    }

  return (
    <Paper className="w-full rounded-20 shadow flex flex-col justify-between">
      <div className="flex items-center justify-between px-4 pt-8">
        <Typography className="text-16 px-16 font-medium" color="textSecondary">
            Impressions
        </Typography>
        <IconButton aria-label="more" size="large">
          <Icon>more_vert</Icon>
        </IconButton>
      </div>
      <div className="text-center py-12">
        <Typography className="text-72 font-semibold leading-none text-red tracking-tighter">
          { props?.impressions ? nFormatter(props?.impressions, 1) : 0 }
        </Typography>
        <Typography className="text-18 font-normal text-red-800">
            Impressions
        </Typography>
      </div>
      <Typography
        className="p-20 pt-0 h-56 flex justify-center items-end text-13 font-medium"
        color="textSecondary"
      >
        {/*<span className="truncate">{props.widget.data.extra.name}</span>:
        <b className="px-8">{props.widget.data.extra.count}</b>*/}
      </Typography>
    </Paper>
  );
}

export default memo(Widget2);
