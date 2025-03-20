import { Button, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react'
import { ConnectBox, ConnectItem } from './styles'
import { Container, Header } from '../styles'
import { signIn, useSession } from 'next-auth/react'

import { ArrowRight } from 'phosphor-react'

export default function ConnectCalendar() {
  // async function handleRegister(data: RegisterFormData) {}
  const session = useSession();

  return (
    <Container>
      <Header>
        <Heading as="strong">Conecte sua agenda!</Heading>
        <Text>
          Conecte o seu calendário para verificar automaticamente as horas
          ocupadas e os novos eventos à medida em que são agendados.
        </Text>
        <MultiStep size={4} currentStep={2} />
      </Header>
      <ConnectBox>
        <ConnectItem>
          <Text>Google Calendar</Text>
          <Button variant="secondary" size="sm" onClick={() => { signIn('google') }}>
            Conectar
            <ArrowRight />
          </Button>
        </ConnectItem>
        <Text>{JSON.stringify(session.data)}</Text>
        <Button type="submit">
          Próximo passo
          <ArrowRight />
        </Button>
      </ConnectBox>
    </Container>
  )
}
