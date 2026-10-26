# Libby — demonstração

Demonstração interativa da **Libby**, a central de automações que desenvolvi
para os setores de Departamento Pessoal e Fiscal de um escritório de
contabilidade.

**[Abrir a demonstração →](https://hugolalmeida.github.io/libby-demo/)**

O sistema é de uso interno, então o código não está aqui. Esta é a interface
real, renderizada como site estático:

- empresas, pessoas, execuções e números são **fictícios**;
- não há servidor: nenhuma ação é salva ou enviada;
- ao clicar em **Executar** numa automação, uma rodada de exemplo é tocada
  como se estivesse rodando agora.

## O que a Libby faz

Reúne mais de 40 automações num só lugar. Ela emite relatórios no Domínio,
publica documentos no Onvio, conclui tarefas no Gestta, confere guias de
DARF e FGTS e envia avisos aos clientes. Quando algo precisa de atenção,
avisa no Discord. O Dashboard mostra falhas, atrasos e quanto trabalho manual
cada rodada poupou.

**Stack:** Python, FastAPI, Jinja2, HTMX, PostgreSQL, Docker, Nginx,
pywinauto (automação do Domínio), Selenium e Playwright, PyMuPDF e pandas.
A web roda numa VPS; as automações de Windows rodam em VMs, por agentes que
buscam serviço na fila.

Desenvolvido por Hugo Almeida.
