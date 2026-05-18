import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'

type ContactFormData = {
    name: string
    email: string
    message: string
    subscribe: boolean
}

export function ContactForm() {
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ContactFormData>({
        defaultValues: {
            name: '',
            email: '',
            message: '',
            subscribe: false,
        },
    })

    
    
    const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
        setSubmitStatus('submitting')

        // Simulated API call — replace with real fetch later
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            console.log('Form submitted:', data)
            setSubmitStatus('success')
            reset()
        } catch {
            setSubmitStatus('error')
        }
    }

    return (
        <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem' }}>
            <h2>Contact Us</h2>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="name" style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        {...register('name', {
                            required: 'Name is required',
                            minLength: { value: 2, message: 'Name must be at least 2 characters' },
                        })}
                        style={{ width: '100%', padding: '0.5rem' }}
                        aria-invalid={errors.name ? 'true' : 'false'}
                    />
                    {errors.name && (
                        <span role="alert" style={{ color: 'red', fontSize: '0.875rem' }}>
              {errors.name.message}
            </span>
                    )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Please enter a valid email address',
                            },
                        })}
                        style={{ width: '100%', padding: '0.5rem' }}
                        aria-invalid={errors.email ? 'true' : 'false'}
                    />
                    {errors.email && (
                        <span role="alert" style={{ color: 'red', fontSize: '0.875rem' }}>
              {errors.email.message}
            </span>
                    )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="message" style={{ display: 'block', marginBottom: '0.25rem' }}>
                        Message
                    </label>
                    <textarea
                        id="message"
                        rows={4}
                        {...register('message', {
                            required: 'Message is required',
                            minLength: { value: 10, message: 'Message must be at least 10 characters' },
                        })}
                        style={{ width: '100%', padding: '0.5rem' }}
                        aria-invalid={errors.message ? 'true' : 'false'}
                    />
                    {errors.message && (
                        <span role="alert" style={{ color: 'red', fontSize: '0.875rem' }}>
              {errors.message.message}
            </span>
                    )}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label>
                        <input type="checkbox" {...register('subscribe')} />
                        {' '}Subscribe to updates
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={submitStatus === 'submitting'}
                    style={{ padding: '0.5rem 1rem' }}
                >
                    {submitStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                </button>

                {submitStatus === 'success' && (
                    <p style={{ color: 'green', marginTop: '1rem' }}>
                        Thanks! Your message was sent.
                    </p>
                )}

                {submitStatus === 'error' && (
                    <p style={{ color: 'red', marginTop: '1rem' }}>
                        Something went wrong. Please try again.
                    </p>
                )}
            </form>
        </div>
    )
}