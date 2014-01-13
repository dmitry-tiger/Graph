package Graph::Auth;
use Mojolicious::Plugin::Authentication;
use Authen::Simple::LDAP;
use Mojo::Base 'Mojolicious::Controller';

sub login{
    my $self=shift;
    my $ldapHost = $self->stash->{config}->{ldap}->{server};
    my $basedn = $self->stash->{config}->{ldap}->{basedn};
    my $binddn = $self->stash->{config}->{ldap}->{binddn};
    my $bindpw = $self->stash->{config}->{ldap}->{bindpw};
    my $filter = $self->stash->{config}->{ldap}->{filter};
    my $ldap = Authen::Simple::LDAP->new(
        host    => $ldapHost,
        binddn  => $binddn,
        bindpw  => $bindpw,
        basedn  => $basedn,
        filter  => $filter
    );
    my $json = $self->req->json;
    my $username = $json->{'username'}||0;
    my $password = $json->{'password'}||0;
    unless (my $test = $self->authenticate($username, $password,$ldap)) {
#       say "Auth for $username Success";
    $self->render(json => {"error"=>"1","error_str"=>"Auth failed :: ".($!||"Invalid login or password")});
    return;
    }
    if ($self->is_user_authenticated) {
        $self->session(expiration => 604800);
        
        $self->render(json => {"error"=>"0","error_str"=>"","username"=>$self->user});    
    }
    else{
        $self->render(json => {"error"=>"1","error_str"=>"Unknown auth error"});
    }
    
#    my $user = $self->user;
#    say "Hi $user";
#    say $self->current_user;
}


sub islogined{
    my $self = shift;
    if ($self->is_user_authenticated){
        $self->render(json => {"authenticated"=>"1","username"=>$self->user});
    }
    else{
        $self->render(json => {"authenticated"=>"0","username"=>""});   
    }
}

sub dologout{
    my $self = shift;
    if ($self->is_user_authenticated){
        $self->logout;
        $self->render(json => {"error"=>"0","error_str"=>"Logout success"}); 
    }
    else{
        $self->render(json => {"error"=>"1","error_str"=>"Not authenticated yet"}); 
    }
}

sub fetchprojects{
    my $self = shift;
    my @data;
    if ($self->is_user_authenticated){
        my $user = $self->user->[0];
        my $sth =$self->db->prepare("select s.screentiny as screentiny, s.screenname as screenname from screens s join users u on s.userid = u.userid where u.username = '$user'") 
        or do {
            $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
            return 0;
        };
        $sth->execute or do {
            $self->render(json => {"error"=>"1","error_str"=>"$DBI::errstr" });
            return 0;
        };
        while (my $ref=$sth->fetchrow_hashref()) {
            push @data,{'tiny'=>$ref->{'screentiny'},'name'=>$ref->{'screenname'}};
        }
        $self->render(json => {"error"=>"0","error_str"=>"", "data" => \@data});
        return 1;
    }
    else{
        $self->render(json => {"error"=>"1","error_str"=>"Not authenticated yet"}); 
    }
}
1;