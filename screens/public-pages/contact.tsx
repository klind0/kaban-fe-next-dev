'use client';
import { Button } from '@/components/ui/button';
import FormControl from '@/components/universal/form-control';
import { getErrorMessage } from '@/lib/getErrorMessage';
import { ContactVariables } from '@/types/contact.types';
import { Controller, useForm } from 'react-hook-form';

export default function ContactUsSection() {
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ContactVariables>({
		defaultValues: {
			email: '',
			fullName: '',
			message: '',
			phone: undefined,
		},
		mode: 'all',
	});

	const onSubmit = async (data: ContactVariables) => {
		console.log(data);
	};

	return (
		<section className="flex flex-col gap-15 items-center px-4 mt-25">
			<div className={`flex flex-col items-center max-w-90`}>
				<h3 className={`text-center text-black text-2xl lg:text-3xl font-bold`}>
					Get in Touch With Kaban.ng
				</h3>
				<p className="text-center">
					Reach out today for personalized assistance and guidance on your
					property journey.
				</p>
			</div>
			<div className={`mt-4 border w-full md:w-[70%] rounded-md`}>
				<form
					className={`flex flex-col gap-5 m-5 md:m-20`}
					onSubmit={handleSubmit(onSubmit)}
				>
					<Controller
						name="fullName"
						control={control}
						rules={{
							required: 'Full name is required',
							validate: {
								minNames: (value) => {
									const names = value?.trim().split(/\s+/) || [];
									return names.length >= 2 || 'Please enter at least 2 names';
								},
							},
						}}
						render={({ field }) => (
							<FormControl
								as="input"
								labelText="Full Name"
								placeholder="John Smith"
								minLength={2}
								maxLength={32}
								required
								{...field}
								error={getErrorMessage(errors.fullName)}
							/>
						)}
					/>
					<Controller
						name="phone"
						control={control}
						rules={{
							required: 'Phone number is required',
							minLength: {
								value: 11,
								message: 'Phone number must be 11 digits',
							},
							maxLength: {
								value: 11,
								message: 'Phone number must be 11 digits',
							},
						}}
						render={({ field }) => (
							<FormControl
								as="input"
								labelText="Phone"
								placeholder="0708xxxxxxx"
								type="number"
								minLength={11}
								maxLength={11}
								{...field}
								error={getErrorMessage(errors.phone)}
							/>
						)}
					/>
					<Controller
						name="email"
						control={control}
						rules={{
							required: 'Email is required',
							pattern: {
								value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
								message: 'Enter a valid email address',
							},
						}}
						render={({ field }) => (
							<FormControl
								as="input"
								labelText="Email address"
								placeholder="you@example.com"
								type="email"
								{...field}
								error={getErrorMessage(errors.email)}
							/>
						)}
					/>
					<Controller
						name="message"
						control={control}
						rules={{
							required: 'Message is required',
						}}
						render={({ field }) => (
							<FormControl
								as="textarea"
								labelText="Message"
								rows={3}
								placeholder="Write your message here..."
								{...field}
								error={getErrorMessage(errors.message)}
							/>
						)}
					/>
					<Button type="submit" className="w-40 mt-3">
						Submit
					</Button>
				</form>
			</div>
		</section>
	);
}
