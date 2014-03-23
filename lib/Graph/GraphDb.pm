package  Graph::GraphDb;

sub new{
    my $class = shift;
    my $self = {
        _database => shift,
        _host  => shift,
        _port       => shift,
        _user       => shift,
        _pass       => shift,
    };
    bless $self, $class;
    return $self;
}

sub connector{
   my $self = shift;
   my $connector = DBIx::Connector->new(
        "dbi:mysql:database=".$self->{_database}.';host='.$self->{_host}.';port='.$self->{_port},
        $self->{_user},$self->{_pass},
        { AutoCommit => 1, }
    );
    $connector->mode('ping');
    return $connector;
}

sub check_url{
    my $self=shift;
    my $url=shift;
    my $sth = $self->connector->run(sub {
      $_->do("select * from screens where screentiny = '$url'");
    });
    $sth eq '0E0' ? return(1) : return(0);
}

sub get_graph_owner{
    my $self=shift;
    my $url=shift;
    my $sth = $self->connector->run(sub{
        my $sth=$_->prepare("select s.screenid as screenid, u.username as username
                            from screens s join users u on s.userid = u.userid where s.screentiny = '$url'")
        or do {
            return { code => 0, error_msg =>"$DBI::errstr" };
        };
        $sth->execute or do {
          return { code => 0, error_msg =>"$DBI::errstr" };
        };
        $sth;
    });
    if ($sth->rows) {
        my $data = $sth->fetchrow_hashref();
        $sth->finish();
        return { code => 1, data => $data };
    } else {
        return { code => 0, error_msg =>"Graph not found" };
    }
}

sub screen_delete{
    my $self=shift;
    my $screen_id=shift;
    my $sth = $self->connector->run(sub{
        my $sth = $_->prepare("delete from screens where screenid='$screen_id'")or do {
          return { code => 0, error_msg =>"$DBI::errstr" };
        };
        $sth->execute or do {
          return { code => 0, error_msg =>"$DBI::errstr" };
        };
        $sth->finish();
        $sth;
    });
    return { code => 1 };
}

1;