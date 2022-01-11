import {yupResolver} from '@hookform/resolvers/yup';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import {useEffect, useRef, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {useDispatch, useSelector} from 'react-redux';
import {registerWithFirebase} from 'app/auth/store/registerSlice';
import * as yup from 'yup';
import _ from '@lodash';
import * as uploader from '../../apps/chat/Components/Uploader';
import '../../apps/chat/Components/Chat.css';

/**
 * Form Validation Schema
 */
const schema = yup.object().shape({
    displayName: yup.string().required('You must enter display name'),
    email: yup.string().email('You must enter a valid email').required('You must enter a email'),
    password: yup
        .string()
        .required('Please enter your password.')
        .min(8, 'Password is too short - should be 8 chars minimum.'),
    passwordConfirm: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const defaultValues = {
    displayName: '',
    email: '',
    password: '',
    passwordConfirm: '',
};

function FirebaseRegisterTab(props) {
    const dispatch = useDispatch();
    const authRegister = useSelector(({auth}) => auth.register);

    const [isFormValid, setIsFormValid] = useState(false);
    const [imgURL, setImgURL] = useState('https://firebasestorage.googleapis.com/v0/b/surge-bb99e.appspot.com/o/profile.png?alt=media&token=d943de99-eb6d-48a6-a886-6c4760459e86');
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

    function onSubmit(model) {
        dispatch(registerWithFirebase(model));
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
        <div className="w-full">
            <form className="flex flex-col justify-center w-full" onSubmit={handleSubmit(onSubmit)}>
                <div id="centerImg">
                    <img onClick={pickAnFile} src={imgURL} id="choosenImage" alt="HA"/>
                    <input name="file" onChange={readURL} type="file"
                           id="pick"/>
                </div>
                <Controller
                    name="displayName"
                    control={control}
                    render={({field}) => (
                        <TextField
                            {...field}
                            className="mb-16"
                            type="text"
                            label="Display name"
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

                <Controller
                    name="password"
                    control={control}
                    render={({field}) => (
                        <TextField
                            {...field}
                            className="mb-16"
                            type="password"
                            label="Password"
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
                />

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    className="w-full mx-auto mt-16"
                    aria-label="REGISTER"
                    disabled={_.isEmpty(dirtyFields) || !isValid}
                    value="legacy"
                >
                    Register
                </Button>
            </form>
        </div>
    );
}

export default FirebaseRegisterTab;
