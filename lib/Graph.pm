package Graph;
use Mojo::Base 'Mojolicious';

# This method will run once at server start
sub startup {
  my $self = shift;
  $self->setup_routing;
  # Documentation browser under "/perldoc"
  $self->plugin('PODRenderer');

  # Router


  # Normal route to controller
}

sub setup_routing {
    my $self = shift;
    my $r = $self->routes;
      $r->get('/')->to('screen#newscreen');
      $r->get('/dash/')->to('screen#dash');
      $r->get('/:id/:type', type => [qw(view dash)])->to( controller => 'screen', view => 'fetch', id => '' );
}

1;
