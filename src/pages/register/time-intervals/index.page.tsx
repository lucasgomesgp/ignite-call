import { Button, Checkbox, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react'
import { Container, Header } from '../styles'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { FormError, IntervalBox, IntervalDay, IntervalInputs, IntervalItem, IntervalsContainer } from './styles'

import { ArrowRight } from 'phosphor-react'
import { getWeekDays } from '@/src/utils/get-week-days'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { convertTimeStringToMinutes } from '@/src/utils/convert-time-string-to-minutes'
import { api } from '@/src/lib/axios'


const timeIntervalsFormInputSchema = z.object({
    intervals: z.array(
        z.object({
            weekDay: z.number().min(0).max(6),
            enabled: z.boolean(),
            startTime: z.string(),
            endTime: z.string(),
        })
    )
        .length(7)
});

const timeIntervalsFormOutputSchema =
    timeIntervalsFormInputSchema.transform(data => data.intervals.filter(intervals => intervals.enabled))
        .refine((intervals) => intervals.length > 0, {
            message: "Você precisa selecionar pelo menos 1 dia da semana!",
            path: ["intervals"]
        })
        .transform(intervals => {
            return intervals.map(interval => {
                return {
                    weekDay: interval.weekDay,
                    startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
                    endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
                }
            })
        })
        .refine(intervals => {
            return intervals.every(interval => interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes)
        }, {
            message: "O horário de término, deve ser pelo menos 1 hora distante do início."
        });


type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormInputSchema>
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormOutputSchema>;

export default function TimeIntervals() {
    const { register, handleSubmit, control, formState: { isSubmitting, errors }, watch } = useForm<TimeIntervalsFormInput>({
        resolver: zodResolver(timeIntervalsFormInputSchema),
        defaultValues: {
            intervals: [
                { weekDay: 0, enabled: false, startTime: "08:00", endTime: "18:00" },
                { weekDay: 1, enabled: true, startTime: "08:00", endTime: "18:00" },
                { weekDay: 2, enabled: true, startTime: "08:00", endTime: "18:00" },
                { weekDay: 3, enabled: true, startTime: "08:00", endTime: "18:00" },
                { weekDay: 4, enabled: true, startTime: "08:00", endTime: "18:00" },
                { weekDay: 5, enabled: true, startTime: "08:00", endTime: "18:00" },
                { weekDay: 6, enabled: false, startTime: "08:00", endTime: "18:00" },
            ]
        }
    });
    const weekDays = getWeekDays();
    const { fields } = useFieldArray({
        control,
        name: "intervals"
    });
    const intervals = watch("intervals");

    async function handleSetTimeIntervals(data: TimeIntervalsFormInput) {
        const { data: intervals } = timeIntervalsFormOutputSchema.safeParse(data)
        await api.post("/users/time-intervals", {
            intervals,
        });
    }
    return (
        <Container>
            <Header>
                <Heading as="strong">Quase lá</Heading>
                <Text>
                    Defina o intervalo de horários que você está disponível em cada dia da semana.
                </Text>
                <MultiStep size={4} currentStep={3} />
            </Header>
            <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
                <IntervalsContainer>
                    {fields.map((field, index) => {
                        return (
                            <IntervalItem key={field.id}>
                                <IntervalDay>
                                    <Controller name={`intervals.${index}.enabled`} control={control} render={({ field }) => {
                                        return (
                                            <Checkbox
                                                // @ts-expect-error
                                                checked={field.value}
                                                onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                    field.onChange(checked === true)
                                                }}
                                            />

                                        )
                                    }}
                                    />
                                    <Text>{weekDays[field.weekDay]}</Text>
                                </IntervalDay>
                                <IntervalInputs>
                                    <TextInput size="sm" type="time" step={60} disabled={intervals[index].enabled === false} {...register(`intervals.${index}.startTime`) as any} />
                                    <TextInput size="sm" type="time" step={60} disabled={intervals[index].enabled === false} {...register(`intervals.${index}.endTime`) as any} />
                                </IntervalInputs>
                            </IntervalItem>
                        )
                    })}
                </IntervalsContainer>
                {errors.intervals?.root && (
                    <FormError size="sm">{errors.intervals.root.message}</FormError>
                )}
                <Button type="submit" disabled={isSubmitting}>
                    Próximo passo
                    <ArrowRight />
                </Button>
            </IntervalBox>
        </Container>
    )
}
