import {motion} from 'framer-motion';
import {useSelector} from 'react-redux';
import {GoogleLogin} from 'react-google-login';
import axios from "axios";
import {selectWidgets} from '../store/widgetsSlice';
import Widget10 from '../widgets/Widget10';
import Widget8 from '../widgets/Widget8';
import Widget9 from '../widgets/Widget9';

function BudgetSummaryTab() {
    const widgets = useSelector(selectWidgets);

    const responseGoogle = (response) => {
        console.log(response);
        const token = response.accessToken;
        if (token) {
            console.log(token);
            const url = `https://googleads.googleapis.com/v9/customers:listAccessibleCustomers`;
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'developer-token': 'ucFViY52x7Dn59dXTPGonw'
                }
            };
            axios.get(
                url,
                config
            ).then((resT) => {
                console.log(resT);
                const customers = resT.data.resourceNames;
                console.log(customers);
                for (let i = 0; i < customers.length; i++) {
                    const customerURL = `https://googleads.googleapis.com/v9/${customers[i]}/googleAds:search`;
                    console.log(customerURL);
                    var str = customers[i];
                    var matches = str.match(/(\d+)/);
                    console.log(matches[0]);
                    const configCustomer = {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'developer-token': 'ucFViY52x7Dn59dXTPGonw',
                            'Content-Type': 'application/json',
                            // 'Host': 'googleads.googleapis.com'
                            // 'login-customer-id': matches[0]
                        }
                    };
                    const data = {
                        "pageSize": 10000,
                        "query": "SELECT ad_group_criterion.keyword.text, ad_group_criterion.status FROM ad_group_criterion WHERE ad_group_criterion.type = 'KEYWORD' AND ad_group_criterion.status = 'ENABLED'"
                    };
                    console.log(data);
                    axios.post(
                        customerURL,
                        data,
                        configCustomer,
                    ).then((resource) => {
                        console.log(resource);
                    }).catch(err => {
                        console.log(err);
                    });
                }
            }).catch(err => {
                console.log(err);
            });
            /*    fetch(url, { // making a request
                method: 'get',
                // mode: 'no-cors',
                headers: requestHeaders
            })
                .then((res) => {
                    console.log('hooray');
                    console.log(res);
                })
                .catch((e) => {
                    console.log('Error:', e);
                });*/
        }
    }

    const container = {
        show: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: {opacity: 0, y: 20},
        show: {opacity: 1, y: 0},
    };

    return (
        <motion.div className="flex flex-wrap" variants={container} initial="hidden" animate="show">
            <GoogleLogin
                clientId="464594885875-grmmpl9puhudasa1rshkdh81d49e7tuf.apps.googleusercontent.com"
                buttonText="Login"
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
                cookiePolicy="single_host_origin"
                scope="https://www.googleapis.com/auth/adwords"
            />,

            <motion.div variants={item} className="widget flex w-full sm:w-1/2 p-12">
                <Widget8 widget={widgets.widget8}/>
            </motion.div>
            <motion.div variants={item} className="widget flex w-full sm:w-1/2 p-12">
                <Widget9 widget={widgets.widget9}/>
            </motion.div>
            <motion.div variants={item} className="widget flex w-full p-12">
                <Widget10 widget={widgets.widget10}/>
            </motion.div>
        </motion.div>
    );
}

export default BudgetSummaryTab;
