import {useSelector} from 'react-redux';
import {motion} from 'framer-motion';
import FacebookLogin from 'react-facebook-login';
import {selectWidgets} from '../store/widgetsSlice';
import Widget1 from '../widgets/Widget1';
import Widget2 from '../widgets/Widget2';
import Widget3 from '../widgets/Widget3';
import Widget4 from '../widgets/Widget4';
import Widget5 from '../widgets/Widget5';
import Widget6 from '../widgets/Widget6';
import Widget7 from '../widgets/Widget7';
import {selectProjects} from "../store/projectsSlice";
import '../widgets/widget.css';


function HomeTab(props) {
    const widgets = useSelector(selectWidgets);
    const projects = useSelector(selectProjects);
    console.log(projects); // props.insight
    const insight = projects.find(product => product.id === props.insight);
    console.log(insight);
    console.log(widgets.widget1);
    console.log(widgets.widget2);

    const container = {
        show: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const responseFacebook = (response) => {
        console.log(response);
    }

    const item = {
        hidden: {opacity: 0, y: 20},
        show: {opacity: 1, y: 0},
    };
    /*
    * impressions: "40124"
reach: "16228"
spend: "995.11"
    * */
    return (
        <motion.div className="flex flex-wrap" variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="widget fonts flex w-full sm:w-1/2 md:w-1/4 p-12">
                <Widget1 widget={widgets.widget1} click={insight?.insights?.data[0].clicks} />
            </motion.div>
            <motion.div variants={item} className="widget fonts flex w-full sm:w-1/2 md:w-1/4 p-12">
                <Widget2 widget={widgets.widget2} impressions={insight?.insights?.data[0].impressions} />
            </motion.div>
            <motion.div variants={item} className="widget fonts flex w-full sm:w-1/2 md:w-1/4 p-12">
                <Widget3 widget={widgets.widget3} reach={insight?.insights?.data[0].reach}/>
            </motion.div>
            <motion.div variants={item} className="widget fonts flex w-full sm:w-1/2 md:w-1/4 p-12">
                <Widget4 widget={widgets.widget4} spend={insight?.insights?.data[0].spend} />
            </motion.div>
            <motion.div variants={item} className="widget flex w-full p-12">
                <Widget5 widget={widgets.widget5} data={insight?.insights?.data[0]} />
            </motion.div>
            <motion.div variants={item} className="widget flex w-full p-12">
                <FacebookLogin
                    appId="466141375138915"
                    autoLoad={true}
                    fields="name,email,picture"
                    // onClick={componentClicked}
                    callback={responseFacebook} />
            </motion.div>
           {/* <motion.div variants={item} className="widget flex w-full sm:w-1/2 p-12">
                <Widget6 widget={widgets.widget6}/>
            </motion.div>
            <motion.div variants={item} className="widget flex w-full sm:w-1/2 p-12">
                <Widget7 widget={widgets.widget7}/>
            </motion.div>*/}
        </motion.div>
    );
}

export default HomeTab;
