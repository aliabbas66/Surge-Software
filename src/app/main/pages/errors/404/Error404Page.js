import Icon from '@mui/material/Icon';
import Input from '@mui/material/Input';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import {motion} from 'framer-motion';
import {Link} from 'react-router-dom';
import {Controller, useForm} from "react-hook-form";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import _ from '../../../../../@lodash';
import {useDispatch, useSelector} from "react-redux";
import {useEffect, useRef, useState} from "react";
import {yupResolver} from "@hookform/resolvers/yup";
import {registerWithFirebase} from "../../../../auth/store/registerSlice";
import * as uploader from "../../../apps/chat/Components/Uploader";
import '../../../apps/chat/Components/Chat.css';
import * as yup from 'yup';
import {getAuth, onAuthStateChanged} from 'firebase/auth';
import * as userSlice from '../../../../auth/store/userSlice';
import { setUserData, updateUserData } from "../../../../auth/store/userSlice";
import firebase from 'firebase/compat/app';
import './profile.css';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
    displayName: yup.string().required('You must enter display name'),
    email: yup.string().email('You must enter a valid email').required('You must enter a email'),
   /* password: yup
        .string()
        .required('Please enter your password.')
        .min(8, 'Password is too short - should be 8 chars minimum.'),
    passwordConfirm: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),*/
});

const defaultValues = {
    displayName: '',
    email: '',
    // password: '',
    // passwordConfirm: '',
};

function Error404Page() {
    const user = useSelector(({ auth }) => auth.user);
    console.log(user);
    const dispatch = useDispatch();
    const authRegister = useSelector(({auth}) => auth.register);

    const [isFormValid, setIsFormValid] = useState(false);
    const [imgURL, setImgURL] = useState(user.data.photoURL);
    const [displayName, setDisplayName] = useState(user.data?.displayName ? user.data.displayName : '');
    defaultValues.displayName = user.data?.displayName ? user.data.displayName : 'no name';
    defaultValues.email = user.data?.email;
    const formRef = useRef(null);
    const {control, formState, handleSubmit, reset, setError} = useForm({
        mode: 'onChange',
        defaultValues,
        resolver: yupResolver(schema),
    });

    const {isValid, dirtyFields, errors} = formState;

    useEffect(() => {
        authRegister.errors.forEach((error) => {
            setError(error.type, {
                type: 'manual',
                message: error.message,
            });
        });
    }, [authRegister.errors, setError]);

    const getCurrentUser = async () => {
        const auth = getAuth();
        let loggedInUser;
        await onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                loggedInUser = currentUser;
                console.log(loggedInUser);
            }
        });
    }

    function onSubmit(model) {
        console.log(model);
        const data = {
            ...user,
            data: {
                ...user.data,
                displayName: displayName,
                photoURL: imgURL
            }
        };
        console.log(data);
        dispatch(userSlice.updateUserData(data));
        const { currentUser } = firebase.auth();
        currentUser.updateProfile(data.data);
        // dispatch(updateUserData(user));
        return dispatch(setUserData(data));
    }

    const pickAnFile = () => {
        if (uploader.isUploading === false) {
            document.getElementById('pick').value = null;
            document.getElementById('pick').click();
        } else {
            alert('There is already some files being upload, please wait...');
        }
    };

    const readURL = async (event) => {
        const file = event.target.files[0];
        const type = file.type.split('/')[0];
        if (type === 'image') {
            await uploader.imageUploader(file, type);
        } else {
            await uploader.fileUploaderOnFirebase(file, type);
        }
        if (uploader.fileURL !== null) {
            setImgURL(uploader.fileURL);
            console.log(uploader.fileURL);
        } else {
            alert('Something Went Wrong');
        }
    };
    return (
        <div className="w-full gggg">
            <form className="flex flex-col justify-center w-full" onSubmit={handleSubmit(onSubmit)}>
                <img onClick={pickAnFile} id="updateImg" src={imgURL} alt="HA"/>
                <input name="file" onChange={readURL} type="file"
                       id="pick"/>
                <Controller
                    name="displayName"
                    control={control}
                    render={({field}) => (
                        <TextField
                            {...field}
                            className="mb-16"
                            type="text"
                            label="Display name"
                            value={displayName}
                            onChange={(event) => {
                                setDisplayName(event.target.value);
                                defaultValues.displayName = event.target.value;
                            }}
                            name="displayName"
                            error={!!errors.displayName}
                            helperText={errors?.displayName?.message}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Icon className="text-20" color="action">
                                            person
                                        </Icon>
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                            required
                        />
                    )}
                />

                <Controller
                    name="email"
                    control={control}
                    render={({field}) => (
                        <TextField
                            {...field}
                            className="mb-16"
                            type="text"
                            error={!!errors.email}
                            helperText={errors?.email?.message}
                            label="Email"
                            disabled={true}
                            value={user.data.email}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Icon className="text-20" color="action">
                                            email
                                        </Icon>
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                            required
                        />
                    )}
                />

            {/*    <Controller
                    name="password"
                    control={control}
                    render={({field}) => (
                        <TextField
                            {...field}
                            className="mb-16"
                            type="password"
                            label="Password"
                            value="11111111"
                            error={!!errors.password}
                            helperText={errors?.password?.message}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Icon className="text-20" color="action">
                                            vpn_key
                                        </Icon>
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                            required
                        />
                    )}
                />

                <Controller
                    name="passwordConfirm"
                    control={control}
                    render={({field}) => (
                        <TextField
                            {...field}
                            className="mb-16"
                            type="password"
                            value="11111111"
                            label="Confirm Password"
                            error={!!errors.passwordConfirm}
                            helperText={errors?.passwordConfirm?.message}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Icon className="text-20" color="action">
                                            vpn_key
                                        </Icon>
                                    </InputAdornment>
                                ),
                            }}
                            variant="outlined"
                            required
                        />
                    )}
                />*/}

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className="w-full mx-auto mt-16"
                    aria-label="REGISTER"
                    // disabled={_.isEmpty(dirtyFields) || !isValid}
                    value="legacy"
                >
                    Update
                </Button>
            </form>
        </div>
        /* <div className="flex flex-col flex-1 items-center justify-center p-16">
           <div className="max-w-512 text-center">
             <motion.div
               initial={{ opacity: 0, scale: 0.6 }}
               animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
             >
               <Typography variant="h1" color="inherit" className="font-medium mb-16">
                 404
               </Typography>
             </motion.div>

             <motion.div
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
             >
               <Typography variant="h5" color="textSecondary" className="mb-16 font-normal">
                 Sorry but we could not find the page you are looking for
               </Typography>
             </motion.div>

             <Paper className="flex items-center w-full h-56 p-16 mt-48 mb-16 shadow">
               <Icon color="action">search</Icon>
               <Input
                 placeholder="Search for anything"
                 className="px-16"
                 disableUnderline
                 fullWidth
                 inputProps={{
                   'aria-label': 'Search',
                 }}
               />
             </Paper>

             <Link className="font-normal" to="/apps/dashboards/project">
               Go back to dashboard
             </Link>
           </div>
         </div>*/
    );
}

export default Error404Page;
