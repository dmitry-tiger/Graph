package Graph::Screen;
use Mojo::Base 'Mojolicious::Controller';

# This action will render a template
sub newscreen {
  my $self = shift;

  # Render template "example/welcome.html.ep" with message
  $self->render(msg => 'This is new screen');
}
sub dash {
  my $self = shift;

  # Render template "example/welcome.html.ep" with message
  $self->render(msg => 'This is new dashboard');
}
sub view {
  my $self = shift;
  my $id = $self->stash( 'id' );
  my $type = $self->stash( 'type' );
  # Render template "example/welcome.html.ep" with message
  $self->render(msg => "Open screen $id with type $type ");
}

1;